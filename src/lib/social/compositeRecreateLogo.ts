import sharp, { type OverlayOptions } from 'sharp'
import { compositeLogoCorner } from '@/lib/imageProcessor'
import type { SocialLogoCorner } from '@/lib/social/socialLogoCorner'
import {
  RECREATE_DEFAULT_LOGO_POSITION,
  RECREATE_DEFAULT_LOGO_SIZE,
  RECREATE_LOGO_SIZE_WIDTH_RATIO,
  recreateLogoOrigin,
  recreateLogoWidthRatioForSize,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'

/** Phase 1 Recreate generate default. Legacy Create still uses social_logo_corner. */
export const RECREATE_DEFAULT_LOGO_CORNER: SocialLogoCorner = 'top-left'

export const RECREATE_LOGO_MIN_WIDTH_RATIO = RECREATE_LOGO_SIZE_WIDTH_RATIO.medium
export const RECREATE_LOGO_MAX_WIDTH_RATIO = RECREATE_LOGO_SIZE_WIDTH_RATIO.large
export const RECREATE_LOGO_PADDING_RATIO = 0.04
export const RECREATE_LOGO_PLATE_LUMA_GAP = 55

export function resolveRecreateLogoCorner(
  _value?: string | null,
): SocialLogoCorner {
  return RECREATE_DEFAULT_LOGO_CORNER
}

/** Wide wordmarks need more width; square/tall marks stay smaller so height stays calm. */
export function recreateLogoWidthRatio(
  aspectWidthOverHeight: number,
  size: RecreateLogoSize = RECREATE_DEFAULT_LOGO_SIZE,
): number {
  return recreateLogoWidthRatioForSize(aspectWidthOverHeight, size)
}

export function channelLuma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function shouldApplyRecreateLogoPlate(logoLuma: number, destLuma: number): boolean {
  return Math.abs(logoLuma - destLuma) < RECREATE_LOGO_PLATE_LUMA_GAP
}

export function recreateLogoPlateFill(destLuma: number): string {
  return destLuma >= 140 ? 'rgba(12,14,18,0.40)' : 'rgba(255,255,255,0.36)'
}

export type RecreateLogoLayout = {
  sourceWidth: number
  sourceHeight: number
  sourceAspect: number
  hasAlpha: boolean
  trimmed: boolean
  widthRatio: number
  width: number
  height: number
  x: number
  y: number
  clipped: boolean
  plate: boolean
}

export function isEmptyLogoPadRgb(r: number, g: number, b: number): boolean {
  const luma = channelLuma(r, g, b)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const sat = max === 0 ? 0 : (max - min) / max
  return luma >= 245 && sat < 0.08
}

/**
 * Turn edge-connected empty padding transparent so a circular mark
 * does not keep a white square. Interior whites (e.g. a $ on teal) stay.
 */
export async function knockOutEdgeConnectedEmptyPad(
  logoBuffer: Buffer,
): Promise<{ buffer: Buffer; knockedOut: boolean }> {
  const { data, info } = await sharp(logoBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const width = info.width
  const height = info.height
  const pixels = Buffer.from(data)
  const seen = new Uint8Array(width * height)
  const queue: number[] = []

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const idx = y * width + x
    if (seen[idx]) return
    const i = idx * 4
    if (pixels[i + 3] < 8 || !isEmptyLogoPadRgb(pixels[i], pixels[i + 1], pixels[i + 2])) return
    seen[idx] = 1
    queue.push(idx)
  }

  for (let x = 0; x < width; x++) {
    enqueue(x, 0)
    enqueue(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y)
    enqueue(width - 1, y)
  }

  let knocked = 0
  while (queue.length) {
    const idx = queue.pop()!
    const i = idx * 4
    pixels[i + 3] = 0
    knocked++
    const x = idx % width
    const y = (idx - x) / width
    enqueue(x + 1, y)
    enqueue(x - 1, y)
    enqueue(x, y + 1)
    enqueue(x, y - 1)
  }

  if (knocked === 0) {
    return { buffer: logoBuffer, knockedOut: false }
  }
  if (knocked > width * height * 0.97) {
    return { buffer: logoBuffer, knockedOut: false }
  }

  const buffer = await sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer()
  return { buffer, knockedOut: true }
}

async function trimNearWhiteEmptyPadding(
  logoBuffer: Buffer,
  before: { width: number; height: number },
  hasAlpha: boolean,
): Promise<{
  buffer: Buffer
  trimmed: boolean
  hasAlpha: boolean
  before: { width: number; height: number }
  after: { width: number; height: number }
}> {
  const { data, info } = await sharp(logoBuffer).raw().toBuffer({ resolveWithObject: true })
  const width = info.width
  const height = info.height
  const channels = info.channels
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * channels
    return [data[i], data[i + 1], data[i + 2]] as const
  }
  const corners = [sample(0, 0), sample(width - 1, 0), sample(0, height - 1), sample(width - 1, height - 1)]
  if (!corners.every(([r, g, b]) => isEmptyLogoPadRgb(r, g, b))) {
    return { buffer: logoBuffer, trimmed: false, hasAlpha, before, after: before }
  }

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      if (isEmptyLogoPadRgb(data[i], data[i + 1], data[i + 2])) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX < minX || maxY < minY) {
    return { buffer: logoBuffer, trimmed: false, hasAlpha, before, after: before }
  }

  const boxW = maxX - minX + 1
  const boxH = maxY - minY + 1
  if (boxW < 8 || boxH < 8 || (boxW === width && boxH === height)) {
    return { buffer: logoBuffer, trimmed: false, hasAlpha, before, after: before }
  }

  const buffer = await sharp(logoBuffer)
    .extract({ left: minX, top: minY, width: boxW, height: boxH })
    .toBuffer()
  return {
    buffer,
    trimmed: true,
    hasAlpha,
    before,
    after: { width: boxW, height: boxH },
  }
}

export async function trimTransparentLogoPadding(
  logoBuffer: Buffer,
): Promise<{
  buffer: Buffer
  trimmed: boolean
  hasAlpha: boolean
  before: { width: number; height: number }
  after: { width: number; height: number }
}> {
  const meta = await sharp(logoBuffer).metadata()
  const before = { width: meta.width ?? 0, height: meta.height ?? 0 }
  if (!before.width || !before.height) {
    return { buffer: logoBuffer, trimmed: false, hasAlpha: Boolean(meta.hasAlpha), before, after: before }
  }

  const knocked = await knockOutEdgeConnectedEmptyPad(logoBuffer)
  logoBuffer = knocked.buffer

  if (meta.hasAlpha || knocked.knockedOut) {
    try {
      const trimmed = await sharp(logoBuffer).ensureAlpha().trim({ threshold: 0 }).toBuffer()
      const afterMeta = await sharp(trimmed).metadata()
      const after = { width: afterMeta.width ?? before.width, height: afterMeta.height ?? before.height }
      if (after.width >= 8 && after.height >= 8 && (after.width !== before.width || after.height !== before.height)) {
        return { buffer: trimmed, trimmed: true, hasAlpha: true, before, after }
      }
    } catch {
      // fall through to near-white empty-pad trim
    }
  }

  try {
    return await trimNearWhiteEmptyPadding(logoBuffer, before, Boolean(meta.hasAlpha))
  } catch {
    return { buffer: logoBuffer, trimmed: false, hasAlpha: Boolean(meta.hasAlpha), before, after: before }
  }
}

async function opaquePixelLuma(buffer: Buffer): Promise<number> {
  const { data } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let sum = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 32) continue
    sum += channelLuma(data[i], data[i + 1], data[i + 2])
    count++
  }
  return count ? sum / count : 128
}

export async function prepareRecreateLogoOverlay(params: {
  logoBuffer: Buffer
  canvasWidth: number
  canvasHeight: number
  position?: RecreateLogoPosition
  size?: RecreateLogoSize
}): Promise<{ overlay: Buffer; layout: RecreateLogoLayout }> {
  const position = params.position ?? RECREATE_DEFAULT_LOGO_POSITION
  const size = params.size ?? RECREATE_DEFAULT_LOGO_SIZE
  const trimmed = await trimTransparentLogoPadding(params.logoBuffer)
  const sourceAspect =
    trimmed.after.width && trimmed.after.height
      ? trimmed.after.width / trimmed.after.height
      : 1
  const widthRatio = recreateLogoWidthRatio(sourceAspect, size)
  const maxLogoW = Math.max(1, Math.round(params.canvasWidth * widthRatio))
  const overlay = await sharp(trimmed.buffer)
    .resize(maxLogoW, maxLogoW, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .toBuffer()
  const overlayMeta = await sharp(overlay).metadata()
  const width = overlayMeta.width ?? maxLogoW
  const height = overlayMeta.height ?? maxLogoW
  const padding = Math.round(
    Math.min(params.canvasWidth, params.canvasHeight) * RECREATE_LOGO_PADDING_RATIO,
  )
  const origin = recreateLogoOrigin({
    canvasWidth: params.canvasWidth,
    canvasHeight: params.canvasHeight,
    logoWidth: width,
    logoHeight: height,
    position,
    padding,
  })

  return {
    overlay,
    layout: {
      sourceWidth: trimmed.before.width,
      sourceHeight: trimmed.before.height,
      sourceAspect,
      hasAlpha: trimmed.hasAlpha,
      trimmed: trimmed.trimmed,
      widthRatio,
      width,
      height,
      x: origin.x,
      y: origin.y,
      clipped: origin.clipped,
      plate: false,
    },
  }
}

async function fetchLogoBuffer(url: string): Promise<Buffer | null> {
  const res = await fetch(url)
  if (!res.ok) {
    console.warn('[Recreate][logo] fetch failed', res.status)
    return null
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function compositeRecreateLogoOntoImage(params: {
  imageBuffer: Buffer
  logoBuffer: Buffer
  position?: RecreateLogoPosition
  size?: RecreateLogoSize
}): Promise<{ buffer: Buffer; layout: RecreateLogoLayout }> {
  const canvasMeta = await sharp(params.imageBuffer).metadata()
  const canvasWidth = canvasMeta.width ?? 1024
  const canvasHeight = canvasMeta.height ?? 1024
  const prepared = await prepareRecreateLogoOverlay({
    logoBuffer: params.logoBuffer,
    canvasWidth,
    canvasHeight,
    position: params.position,
    size: params.size,
  })

  let plate = false
  const layers: OverlayOptions[] = []
  try {
    const destRegion = await sharp(params.imageBuffer)
      .extract({
        left: prepared.layout.x,
        top: prepared.layout.y,
        width: prepared.layout.width,
        height: prepared.layout.height,
      })
      .toBuffer()
    const destLuma = await opaquePixelLuma(destRegion)
    const logoLuma = await opaquePixelLuma(prepared.overlay)
    if (shouldApplyRecreateLogoPlate(logoLuma, destLuma)) {
      plate = true
      const pad = Math.round(Math.max(6, Math.min(prepared.layout.width, prepared.layout.height) * 0.08))
      const plateW = prepared.layout.width + pad * 2
      const plateH = prepared.layout.height + pad * 2
      const radius = Math.round(Math.min(plateW, plateH) * 0.5)
      const left = Math.max(0, prepared.layout.x - pad)
      const top = Math.max(0, prepared.layout.y - pad)
      const fill = recreateLogoPlateFill(destLuma)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${plateW}" height="${plateH}"><rect x="0" y="0" width="${plateW}" height="${plateH}" rx="${radius}" fill="${fill}"/></svg>`
      layers.push({ input: Buffer.from(svg), left, top })
    }
  } catch {
    plate = false
  }

  layers.push({
    input: prepared.overlay,
    left: prepared.layout.x,
    top: prepared.layout.y,
  })

  const buffer = await sharp(params.imageBuffer)
    .composite(layers)
    .webp({ quality: 85 })
    .toBuffer()

  const layout = { ...prepared.layout, plate }
  console.log('[Recreate][logo]', {
    sourceWidth: layout.sourceWidth,
    sourceHeight: layout.sourceHeight,
    aspect: Number(layout.sourceAspect.toFixed(4)),
    hasAlpha: layout.hasAlpha,
    trimmed: layout.trimmed,
    position: params.position ?? RECREATE_DEFAULT_LOGO_POSITION,
    size: params.size ?? RECREATE_DEFAULT_LOGO_SIZE,
    widthRatio: layout.widthRatio,
    finalWidth: layout.width,
    finalHeight: layout.height,
    x: layout.x,
    y: layout.y,
    plate: layout.plate,
    clipped: layout.clipped,
  })

  return { buffer, layout }
}

export type ApplyRecreateBusinessLogoInput = {
  imageBuffer: Buffer
  logoUrl: string | null | undefined
  showLogo: boolean
  logoCorner?: string | null
  logoPosition?: RecreateLogoPosition
  logoSize?: RecreateLogoSize
  resolveLogoUrl: (logoUrl: string) => Promise<string | null>
  composite?: typeof compositeLogoCorner
  fetchLogo?: (url: string) => Promise<Buffer | null>
}

/**
 * Deterministic real-logo overlay for reference_recreation.
 * Never sends the logo into GPT-Image-2.
 * Never re-composite from a branded preview - callers must pass the clean -base.webp.
 */
export async function applyRecreateBusinessLogo(
  input: ApplyRecreateBusinessLogoInput,
): Promise<{ buffer: Buffer; composited: boolean; layout?: RecreateLogoLayout }> {
  if (!input.showLogo) {
    return { buffer: input.imageBuffer, composited: false }
  }
  const raw = input.logoUrl?.trim()
  if (!raw) {
    return { buffer: input.imageBuffer, composited: false }
  }

  const fetchUrl = await input.resolveLogoUrl(raw)
  if (!fetchUrl) {
    return { buffer: input.imageBuffer, composited: false }
  }

  if (input.composite) {
    const buffer = await input.composite(input.imageBuffer, fetchUrl, {
      corner: resolveRecreateLogoCorner(input.logoCorner),
      maxLogoWidthRatio: RECREATE_LOGO_MAX_WIDTH_RATIO,
      paddingRatio: RECREATE_LOGO_PADDING_RATIO,
    })
    return { buffer, composited: true }
  }

  try {
    const logoBuffer = await (input.fetchLogo ?? fetchLogoBuffer)(fetchUrl)
    if (!logoBuffer?.length) {
      return { buffer: input.imageBuffer, composited: false }
    }
    const result = await compositeRecreateLogoOntoImage({
      imageBuffer: input.imageBuffer,
      logoBuffer,
      position: input.logoPosition,
      size: input.logoSize,
    })
    return { buffer: result.buffer, composited: true, layout: result.layout }
  } catch (err) {
    console.warn(
      '[Recreate][logo] composite failed',
      err instanceof Error ? err.message : String(err),
    )
    return { buffer: input.imageBuffer, composited: false }
  }
}
