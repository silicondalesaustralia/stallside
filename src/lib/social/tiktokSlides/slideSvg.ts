import { charsPerLineForWidth, wrapTextToLines } from '@/lib/social/infographic/wrapText'
import { isLightColor } from '@/lib/utils/colorContrast'
import type { TikTokSlideText } from '@/lib/social/tiktokSlides/slideTypes'

export type SlideSvgInput = {
  width: number
  height: number
  slide: TikTokSlideText
  index: number
  total: number
  brandColor: string
  businessName: string
  /** Photo underneath: transparent canvas with a dark scrim, white text. */
  overPhoto: boolean
  showCounter: boolean
}

const DARK = '#0A0A0A'
const LIGHT = '#FFFFFF'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function safeBrandColor(raw: string | null | undefined): string {
  const value = raw?.trim() ?? ''
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#F5C518'
}

function tspans(lines: string[], x: number, lineHeightPx: number): string {
  return lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeightPx}">${escapeXml(line)}</tspan>`)
    .join('')
}

/**
 * One slide as SVG. Text stays inside TikTok's safe area (clear of the
 * right-hand action rail and the bottom caption overlay).
 */
export function buildSlideSvg(input: SlideSvgInput): string {
  const { width, height, slide, overPhoto, brandColor } = input
  const textColor = overPhoto ? LIGHT : isLightColor(brandColor) ? DARK : LIGHT
  const accent = overPhoto ? brandColor : textColor
  const padLeft = Math.round(width * 0.08)
  const contentW = width - padLeft - Math.round(width * 0.14)
  const isCover = input.index === 0

  const headingSize = Math.round(width * (isCover ? 0.105 : 0.085))
  const headingLine = Math.round(headingSize * 1.08)
  const heading = wrapTextToLines(
    slide.heading.toUpperCase(),
    charsPerLineForWidth(contentW, headingSize),
    isCover ? 5 : 4,
  ).lines

  const bodySize = Math.round(width * 0.044)
  const bodyLine = Math.round(bodySize * 1.35)
  const body = slide.body ? wrapTextToLines(slide.body, charsPerLineForWidth(contentW, bodySize), 7).lines : []

  const blockH = heading.length * headingLine + (body.length ? 60 + body.length * bodyLine : 0)
  const safeTop = Math.round(height * 0.14)
  const safeBottom = Math.round(height * 0.72)
  const startY = Math.max(safeTop, Math.round((safeTop + safeBottom - blockH) / 2)) + headingSize
  const accentY = startY + (heading.length - 1) * headingLine + 30
  const bodyY = accentY + 30 + bodySize

  const background = overPhoto
    ? `<defs><linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.35"/>
        <stop offset="55%" stop-color="#000" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
      </linearGradient></defs><rect width="100%" height="100%" fill="url(#scrim)"/>`
    : `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${brandColor}"/>
        <stop offset="100%" stop-color="${brandColor}" stop-opacity="0.82"/>
      </linearGradient></defs><rect width="100%" height="100%" fill="${DARK}"/>
      <rect width="100%" height="100%" fill="url(#bg)"/>`

  const counter = input.showCounter
    ? `<text x="${width - padLeft}" y="${Math.round(height * 0.08)}" text-anchor="end" font-family="Inter"
        font-size="${Math.round(width * 0.032)}" fill="${textColor}" fill-opacity="0.85">${input.index + 1}/${input.total}</text>`
    : ''

  const bodySvg = body.length
    ? `<text x="${padLeft}" y="${bodyY}" font-family="Inter" font-size="${bodySize}" fill="${textColor}">${tspans(body, padLeft, bodyLine)}</text>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${background}
  ${counter}
  <text x="${padLeft}" y="${startY}" font-family="Anton" font-size="${headingSize}" fill="${textColor}">${tspans(heading, padLeft, headingLine)}</text>
  <rect x="${padLeft}" y="${accentY}" width="${Math.round(width * 0.14)}" height="10" rx="5" fill="${accent}"/>
  ${bodySvg}
  <text x="${padLeft}" y="${Math.round(height * 0.79)}" font-family="Inter" font-size="${Math.round(width * 0.034)}"
    fill="${textColor}" fill-opacity="0.9">${escapeXml(input.businessName)}</text>
</svg>`
}
