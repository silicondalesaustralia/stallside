import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

/** Long edge cap for rendered output - keeps 30 min encodes and file sizes manageable. */
export const VIDEO_OUTPUT_MAX_LONG_EDGE = 1920

const BLUR_MIN_PX = 16
const BLUR_MAX_RADIUS = 40

function even(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2)
}

export function videoOutputDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxLongEdge = VIDEO_OUTPUT_MAX_LONG_EDGE,
): { width: number; height: number; scaled: boolean } {
  const longEdge = Math.max(sourceWidth, sourceHeight)
  if (longEdge <= maxLongEdge) {
    return { width: sourceWidth, height: sourceHeight, scaled: false }
  }
  const ratio = maxLongEdge / longEdge
  return {
    width: even(sourceWidth * ratio),
    height: even(sourceHeight * ratio),
    scaled: true,
  }
}

export type BlurPixelBox = { x: number; y: number; w: number; h: number; start: number; end: number }

export function blurRegionToPixels(
  region: VideoBlurRegion,
  frameWidth: number,
  frameHeight: number,
): BlurPixelBox | null {
  const w = Math.min(even(region.width * frameWidth), frameWidth - (frameWidth % 2))
  const h = Math.min(even(region.height * frameHeight), frameHeight - (frameHeight % 2))
  if (w < BLUR_MIN_PX || h < BLUR_MIN_PX) return null
  const x = Math.min(even(region.x * frameWidth), frameWidth - w)
  const y = Math.min(even(region.y * frameHeight), frameHeight - h)
  return { x: Math.max(0, x), y: Math.max(0, y), w, h, start: region.start, end: region.end }
}

/** boxblur chroma planes are half size on 4:2:0, so radius must stay under min(w,h)/4. */
export function blurRadius(w: number, h: number): number {
  return Math.max(1, Math.min(BLUR_MAX_RADIUS, Math.floor(Math.min(w, h) / 4) - 1))
}

/**
 * Scale (if needed) then blur each box only during its time window.
 * Returns the filter chain and the label later filters should read from.
 */
export function buildPreBrandingFilters(params: {
  sourceLabel: string
  scaleTo: { width: number; height: number } | null
  frameWidth: number
  frameHeight: number
  blurRegions: VideoBlurRegion[]
}): { filters: string[]; label: string } {
  const filters: string[] = []
  let label = params.sourceLabel

  if (params.scaleTo) {
    filters.push(`[${label}]scale=${params.scaleTo.width}:${params.scaleTo.height},setsar=1[v_scaled]`)
    label = 'v_scaled'
  }

  params.blurRegions.forEach((region, index) => {
    const box = blurRegionToPixels(region, params.frameWidth, params.frameHeight)
    if (!box) return
    const enable = `enable='between(t,${box.start.toFixed(3)},${box.end.toFixed(3)})'`
    const radius = blurRadius(box.w, box.h)
    filters.push(
      `[${label}]split=2[blur_base_${index}][blur_src_${index}]`,
      `[blur_src_${index}]crop=${box.w}:${box.h}:${box.x}:${box.y},boxblur=luma_radius=${radius}:luma_power=3[blur_box_${index}]`,
      `[blur_base_${index}][blur_box_${index}]overlay=${box.x}:${box.y}:${enable}[v_blur_${index}]`,
    )
    label = `v_blur_${index}`
  })

  return { filters, label }
}
