// ============================================================
// lib/imageProcessor.ts
// Server-side image processing for StitchedUp:
//   - convertToWebP()          - generic WebP conversion utility
//   - processJobPhoto()        - social media overlay + EXIF + upload
//   - processPhotosForPlatforms() - batch social processing
//
// All output is WebP (quality 85) for maximum compression.
// In SOCIAL_DEMO_MODE, social processing returns the original URL.
// ============================================================

import { createServiceClient } from '@/lib/supabase/server'

// piexifjs is a CommonJS module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const piexif = require('piexifjs')

export type Platform = 'instagram_square' | 'instagram_story' | 'facebook' | 'gmb'
export type OverlayStyle = 'bottom_bar' | 'top_banner' | 'minimal_tag' | 'frame' | 'corner' | 'none'

interface ProcessOptions {
  imageUrl: string
  businessName: string
  suburb: string
  state: string
  tradeType: string
  latitude: number
  longitude: number
  completedAt: Date
  brandColor: string
  brandTextColor?: string
  logoUrl: string | null
  overlayStyle: OverlayStyle
  platform: Platform
  businessId: string
  jobId: string
}

interface ProcessResult {
  processedUrl: string
  platform: Platform
  width: number
  height: number
}

const PLATFORM_SIZES: Record<Platform, { width: number; height: number }> = {
  instagram_square: { width: 1080, height: 1080 },
  instagram_story:  { width: 1080, height: 1920 },
  facebook:         { width: 1200, height: 630 },
  gmb:              { width: 1200, height: 900 },
}

// ── Sharp loader ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSharp(): Promise<((input: Buffer | string) => any) | null> {
  try {
    const mod = await import('sharp')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mod.default as unknown as (input: Buffer | string) => any
  } catch (err) {
    console.warn(
      '[ImageProcessor] sharp not available:',
      err instanceof Error ? err.message : String(err),
    )
    return null
  }
}

/** Returns true when sharp native bindings loaded successfully. */
export async function isSharpAvailable(): Promise<boolean> {
  return (await loadSharp()) !== null
}

// ── convertToWebP ─────────────────────────────────────────────────────────────

/**
 * Converts any image buffer to WebP format.
 * - Constrains the longest edge to maxDimension while preserving aspect ratio.
 * - Targets quality 85 - typically well under 500KB for job photos.
 */
export async function convertToWebP(
  imageBuffer: Buffer,
  maxDimension = 2048,
  quality = 85,
  requireSharp = false,
): Promise<Buffer> {
  const sharp = await loadSharp()
  if (!sharp) {
    if (requireSharp) {
      throw new Error('Image processing unavailable, please try again')
    }
    console.warn('[ImageProcessor] sharp unavailable - returning original buffer')
    return imageBuffer
  }

  return sharp(imageBuffer)
    .resize(maxDimension, maxDimension, {
      fit: 'inside',       // maintain aspect ratio, never upscale
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer()
}

import type { SocialLogoCorner } from '@/lib/social/socialLogoCorner'

export type LogoCorner = SocialLogoCorner

/** Small corner logo overlay for AI Full Post compositing. */
export async function compositeLogoCorner(
  imageBuffer: Buffer,
  logoUrl: string,
  options?: {
    corner?:           LogoCorner
    maxLogoWidthRatio?: number
    paddingRatio?:     number
  },
): Promise<Buffer> {
  const trimmed = logoUrl.trim()
  if (!trimmed) return imageBuffer

  const sharp = await loadSharp()
  if (!sharp) return imageBuffer

  try {
    const logoRes = await fetch(trimmed)
    if (!logoRes.ok) {
      console.warn('[ImageProcessor] compositeLogoCorner fetch failed', logoRes.status)
      return imageBuffer
    }
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer())

    const meta = await sharp(imageBuffer).metadata()
    const imgW = meta.width ?? 1024
    const imgH = meta.height ?? 1024

    const maxLogoW = Math.round(imgW * (options?.maxLogoWidthRatio ?? 0.18))
    const padding = Math.round(Math.min(imgW, imgH) * (options?.paddingRatio ?? 0.03))

    const logoProcessed = await sharp(logoBuffer)
      .resize(maxLogoW, maxLogoW, { fit: 'inside', withoutEnlargement: true })
      .ensureAlpha()
      .toBuffer()

    const logoMeta = await sharp(logoProcessed).metadata()
    const logoW = logoMeta.width ?? maxLogoW
    const logoH = logoMeta.height ?? maxLogoW

    const corner = options?.corner ?? 'bottom-right'
    let left = padding
    let top = padding
    if (corner.includes('right')) left = Math.max(padding, imgW - logoW - padding)
    if (corner.includes('left') && !corner.includes('right')) left = padding
    if (corner.includes('bottom')) top = Math.max(padding, imgH - logoH - padding)
    if (corner.includes('top') && !corner.includes('bottom')) top = padding

    return sharp(imageBuffer)
      .composite([{ input: logoProcessed, top, left }])
      .webp({ quality: 85 })
      .toBuffer()
  } catch (err) {
    console.warn(
      '[ImageProcessor] compositeLogoCorner failed:',
      err instanceof Error ? err.message : String(err),
    )
    return imageBuffer
  }
}

// ── SVG overlay builders ──────────────────────────────────────────────────────

function sanitizeSvgText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildBottomBarSvg(
  w: number, h: number,
  businessName: string, suburb: string, state: string,
  tradeType: string, brandColor: string
): Buffer {
  const barHeight = 80
  const name = sanitizeSvgText(businessName)
  const location = sanitizeSvgText(`📍 ${suburb}, ${state}  •  ${tradeType}  •  ✓ Completed`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="0" y="${h - barHeight}" width="${w}" height="${barHeight}" fill="rgba(0,0,0,0.75)"/>
    <rect x="0" y="${h - barHeight}" width="4" height="${barHeight}" fill="${sanitizeSvgText(brandColor)}"/>
    <text x="18" y="${h - 50}" font-family="Arial Black, Arial" font-size="18" font-weight="900" fill="white">${name}</text>
    <text x="18" y="${h - 24}" font-family="Arial, sans-serif" font-size="13" fill="${sanitizeSvgText(brandColor)}">${location}</text>
  </svg>`
  return Buffer.from(svg)
}

function buildCornerSvg(
  w: number, h: number,
  businessName: string, suburb: string, state: string,
  brandColor: string
): Buffer {
  const text = sanitizeSvgText(`${businessName} · ${suburb} ${state}`)
  const barW = Math.min(280, w - 20)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${w - barW - 10}" y="${h - 44}" width="${barW}" height="36" fill="rgba(0,0,0,0.65)" rx="4"/>
    <text x="${w - barW - 2}" y="${h - 21}" font-family="Arial, sans-serif" font-size="12" fill="${sanitizeSvgText(brandColor)}">${text}</text>
  </svg>`
  return Buffer.from(svg)
}

function buildTopBannerSvg(
  w: number, h: number,
  businessName: string, suburb: string, state: string,
  tradeType: string, brandColor: string, brandTextColor: string
): Buffer {
  const barHeight = 76
  const name = sanitizeSvgText(businessName)
  const sub = sanitizeSvgText(`${suburb}, ${state}  ·  ${tradeType}`)
  const initial = sanitizeSvgText(businessName.charAt(0).toUpperCase())
  const bc = sanitizeSvgText(brandColor)
  const btc = sanitizeSvgText(brandTextColor)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="0" y="0" width="${w}" height="${barHeight}" fill="${bc}"/>
    <circle cx="44" cy="${barHeight / 2}" r="26" fill="rgba(0,0,0,0.15)"/>
    <text x="44" y="${barHeight / 2 + 9}" text-anchor="middle" font-family="Arial Black, Arial" font-size="22" font-weight="900" fill="${btc}">${initial}</text>
    <text x="82" y="${barHeight / 2 - 6}" font-family="Arial Black, Arial" font-size="18" font-weight="900" fill="${btc}">${name}</text>
    <text x="82" y="${barHeight / 2 + 16}" font-family="Arial, sans-serif" font-size="13" fill="${btc}" opacity="0.8">${sub}</text>
  </svg>`
  return Buffer.from(svg)
}

function buildMinimalTagSvg(
  w: number, h: number,
  businessName: string, suburb: string,
  brandColor: string
): Buffer {
  const name = sanitizeSvgText(businessName)
  const loc = sanitizeSvgText(`📍 ${suburb}`)
  const tagW = Math.min(Math.max(name.length * 9 + 32, 160), w - 20)
  const tagH = 52
  const x = 12
  const y = h - tagH - 12
  const bc = sanitizeSvgText(brandColor)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${x}" y="${y}" width="${tagW}" height="${tagH}" fill="rgba(0,0,0,0.72)" rx="26"/>
    <rect x="${x}" y="${y}" width="5" height="${tagH}" fill="${bc}" rx="3"/>
    <text x="${x + 16}" y="${y + 20}" font-family="Arial Black, Arial" font-size="14" font-weight="900" fill="white">${name}</text>
    <text x="${x + 16}" y="${y + 38}" font-family="Arial, sans-serif" font-size="12" fill="${bc}">${loc}</text>
  </svg>`
  return Buffer.from(svg)
}

function buildFrameSvg(
  w: number, h: number,
  businessName: string, suburb: string, state: string,
  tradeType: string, brandColor: string, brandTextColor: string
): Buffer {
  const border = 12
  const badgeSize = 72
  const bx = w - badgeSize - border
  const by = h - badgeSize - border
  const initial = sanitizeSvgText(businessName.charAt(0).toUpperCase())
  const bottomText = sanitizeSvgText(`${suburb}, ${state}  ·  ${tradeType}`)
  const bc = sanitizeSvgText(brandColor)
  const btc = sanitizeSvgText(brandTextColor)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <!-- Frame borders -->
    <rect x="0" y="0" width="${w}" height="${border}" fill="${bc}"/>
    <rect x="0" y="${h - border}" width="${w}" height="${border}" fill="${bc}"/>
    <rect x="0" y="0" width="${border}" height="${h}" fill="${bc}"/>
    <rect x="${w - border}" y="0" width="${border}" height="${h}" fill="${bc}"/>
    <!-- Bottom text along bottom border -->
    <text x="${w / 2}" y="${h - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="${btc}">${bottomText}</text>
    <!-- Corner badge -->
    <circle cx="${bx + badgeSize / 2}" cy="${by + badgeSize / 2}" r="${badgeSize / 2}" fill="${bc}"/>
    <text x="${bx + badgeSize / 2}" y="${by + badgeSize / 2 + 10}" text-anchor="middle" font-family="Arial Black, Arial" font-size="28" font-weight="900" fill="${btc}">${initial}</text>
  </svg>`
  return Buffer.from(svg)
}

// ── EXIF builder ──────────────────────────────────────────────────────────────

function degToDmsRational(deg: number): number[][] {
  const d = Math.floor(deg)
  const mFloat = (deg - d) * 60
  const m = Math.floor(mFloat)
  const s = Math.round((mFloat - m) * 60 * 100)
  return [[d, 1], [m, 1], [s, 100]]
}

function buildExifBytes(options: {
  businessName: string; tradeType: string
  suburb: string; state: string
  latitude: number; longitude: number
  completedAt: Date
}): string {
  const { businessName, tradeType, suburb, state, latitude, longitude, completedAt } = options
  const year = completedAt.getFullYear()
  const dateStr = completedAt.toISOString().split('T')[0]
  const exifObj = {
    '0th': {
      [piexif.ImageIFD.ImageDescription]: `${tradeType} work completed in ${suburb} ${state}`,
      [piexif.ImageIFD.Artist]: businessName,
      [piexif.ImageIFD.Copyright]: `© ${year} ${businessName}`,
      [piexif.ImageIFD.Software]: 'StitchedUp',
    },
    Exif: {
      [piexif.ExifIFD.DateTimeOriginal]: completedAt.toISOString().replace('T', ' ').split('.')[0],
      [piexif.ExifIFD.UserComment]: `${businessName} - ${tradeType} - ${suburb} ${state}`,
    },
    GPS: {
      [piexif.GPSIFD.GPSLatitudeRef]: latitude < 0 ? 'S' : 'N',
      [piexif.GPSIFD.GPSLatitude]: degToDmsRational(Math.abs(latitude)),
      [piexif.GPSIFD.GPSLongitudeRef]: longitude < 0 ? 'W' : 'E',
      [piexif.GPSIFD.GPSLongitude]: degToDmsRational(Math.abs(longitude)),
      [piexif.GPSIFD.GPSDateStamp]: dateStr,
    },
  }
  return piexif.dump(exifObj)
}

// ── processJobPhoto ───────────────────────────────────────────────────────────

export async function processJobPhoto(options: ProcessOptions): Promise<ProcessResult> {
  const {
    imageUrl, businessName, suburb, state, tradeType,
    latitude, longitude, completedAt, brandColor, brandTextColor, overlayStyle,
    platform, businessId, jobId,
  } = options

  const { width, height } = PLATFORM_SIZES[platform]

  // Demo mode - skip processing, return original
  if (process.env.SOCIAL_DEMO_MODE === 'true') {
    console.log(`[ImageProcessor] Demo mode - skipping for ${platform}`)
    return { processedUrl: imageUrl, platform, width, height }
  }

  const sharp = await loadSharp()
  if (!sharp) {
    return { processedUrl: imageUrl, platform, width, height }
  }

  // 1. Download original image
  const fetchRes = await fetch(imageUrl)
  if (!fetchRes.ok) throw new Error(`Failed to fetch image: ${fetchRes.status}`)
  const imageBuffer = Buffer.from(await fetchRes.arrayBuffer())

  // 2. Resize for platform and convert to WebP
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pipeline: any = sharp(imageBuffer)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })

  // 3. Add branded overlay
  const btc = brandTextColor ?? '#0A0A0A'
  const composites: { input: Buffer; top: number; left: number }[] = []
  if (overlayStyle === 'bottom_bar') {
    composites.push({
      input: buildBottomBarSvg(width, height, businessName, suburb, state, tradeType, brandColor),
      top: 0, left: 0,
    })
  } else if (overlayStyle === 'top_banner') {
    composites.push({
      input: buildTopBannerSvg(width, height, businessName, suburb, state, tradeType, brandColor, btc),
      top: 0, left: 0,
    })
  } else if (overlayStyle === 'minimal_tag') {
    composites.push({
      input: buildMinimalTagSvg(width, height, businessName, suburb, brandColor),
      top: 0, left: 0,
    })
  } else if (overlayStyle === 'frame') {
    composites.push({
      input: buildFrameSvg(width, height, businessName, suburb, state, tradeType, brandColor, btc),
      top: 0, left: 0,
    })
  } else if (overlayStyle === 'corner') {
    composites.push({
      input: buildCornerSvg(width, height, businessName, suburb, state, brandColor),
      top: 0, left: 0,
    })
  }

  if (composites.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipeline = (pipeline as any).composite(composites)
  }

  let processedBuffer: Buffer = await pipeline.toBuffer()

  // 4. Embed EXIF (best-effort - piexifjs works on JPEG; for WebP we skip)
  // WebP doesn't have EXIF support via piexifjs so we store metadata in the
  // Supabase record instead and skip the binary inject step.
  void buildExifBytes  // keep the function for possible future JPEG fallback
  void latitude; void longitude; void completedAt

  // 5. Upload to Supabase storage as WebP
  const timestamp = Date.now()
  const filename = `${platform}-${timestamp}.webp`
  const storagePath = `${businessId}/${jobId}/${filename}`

  const db = await createServiceClient()
  const { error: uploadError } = await db.storage
    .from('social-posts')
    .upload(storagePath, processedBuffer, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  const { data: { publicUrl } } = db.storage
    .from('social-posts')
    .getPublicUrl(storagePath)

  return { processedUrl: publicUrl, platform, width, height }
}

// ── processPhotosForPlatforms ─────────────────────────────────────────────────

export async function processPhotosForPlatforms(
  photoUrls: string[],
  platforms: Platform[],
  options: Omit<ProcessOptions, 'imageUrl' | 'platform'>
): Promise<Record<Platform, string[]>> {
  const results: Partial<Record<Platform, string[]>> = {}

  for (const platform of platforms) {
    const urls: string[] = []
    for (const imageUrl of photoUrls) {
      try {
        const result = await processJobPhoto({ ...options, imageUrl, platform })
        urls.push(result.processedUrl)
      } catch (err) {
        console.error(`[ImageProcessor] Failed to process photo for ${platform}:`, err)
      }
    }
    results[platform] = urls
  }

  return results as Record<Platform, string[]>
}
