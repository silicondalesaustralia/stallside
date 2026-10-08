import { Resvg } from '@resvg/resvg-js'
import {
  assertBundledSocialFontsPresent,
  bundledSocialFontPaths,
} from '@/lib/social/bundledSocialFonts'
import { charsPerLineForWidth, wrapTextToLines } from '@/lib/social/infographic/wrapText'
import {
  INFOGRAPHIC_PLATFORM_SIZES,
  type InfographicPlatformId,
} from '@/lib/social/infographic/platformSizes'

export type { InfographicPlatformId }
export { INFOGRAPHIC_PLATFORM_SIZES }

/** Realistic AU tradie checklist copy - mixed line lengths for wrap stress. */
export const CHECKLIST_SPIKE_ITEMS_FULL = [
  'Switch off power at the meter before any switchboard work',
  'Test dead with a verified multimeter - never assume isolation',
  'Label circuits clearly so the homeowner knows what each breaker feeds',
  'Confirm RCD protection on all wet-area and outdoor circuits',
  'Dispose of old fittings and cable offcuts through licensed waste',
  'Photo-document the finished board and meter enclosure',
  'Issue compliance certificate and explain safety switches to the client',
] as const

export interface ChecklistLayoutInput {
  platform: InfographicPlatformId
  itemCount: 3 | 5 | 7
  title?: string
  brandColor?: string
}

export interface ChecklistItemLayout {
  index: number
  text: string
  lines: string[]
  truncated: boolean
  rowHeightPx: number
  fontSizePx: number
}

export interface ChecklistLayoutMetrics {
  platform: InfographicPlatformId
  width: number
  height: number
  itemCount: number
  titleFontSizePx: number
  listFontSizePx: number
  rowHeightPx: number
  maxLinesPerItem: number
  charsPerLine: number
  listAreaHeightPx: number
  anyTruncated: boolean
  compactMode: boolean
  /** Heuristic: row height below readable floor or max lines hit on multiple items */
  crampedRisk: 'low' | 'medium' | 'high'
  items: ChecklistItemLayout[]
}

export interface ChecklistRenderResult {
  png: Buffer
  metrics: ChecklistLayoutMetrics
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function computeLayoutMetrics(
  input: ChecklistLayoutInput,
  items: readonly string[],
): Omit<ChecklistLayoutMetrics, 'items'> & { items: ChecklistItemLayout[] } {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[input.platform]
  const count = items.length
  const compactMode = input.platform === 'facebook' || (height <= 700 && count >= 5)

  const padX = Math.round(width * 0.07)
  const padTop = Math.round(height * (compactMode ? 0.06 : 0.08))
  const footerH = compactMode ? 0 : Math.round(height * 0.06)
  const titleBlockH = Math.round(height * (compactMode ? 0.14 : 0.12))

  const listTop = padTop + titleBlockH
  const listBottom = height - padTop - footerH
  const listAreaHeightPx = listBottom - listTop

  const rowGap = count >= 7 && compactMode ? 4 : count >= 5 ? 6 : 10
  const rowHeightPx = (listAreaHeightPx - rowGap * (count - 1)) / count

  const minRowFont = compactMode ? 11 : 13
  const maxRowFont = compactMode ? 17 : input.platform === 'gmb' ? 26 : 22
  let listFontSizePx = clamp(rowHeightPx * 0.38, minRowFont, maxRowFont)

  const lineHeightRatio = 1.22
  let maxLinesPerItem = Math.max(
    1,
    Math.floor(rowHeightPx / (listFontSizePx * lineHeightRatio)),
  )

  if (maxLinesPerItem < 2 && count >= 5 && compactMode) {
    listFontSizePx = clamp(rowHeightPx / (2 * lineHeightRatio), minRowFont, maxRowFont)
    maxLinesPerItem = Math.max(
      1,
      Math.floor(rowHeightPx / (listFontSizePx * lineHeightRatio)),
    )
  }

  const numberColW = Math.round(listFontSizePx * 1.8)
  const contentWidth = width - padX * 2 - numberColW - 12
  const charsPerLine = charsPerLineForWidth(contentWidth, listFontSizePx)

  const titleFontSizePx = clamp(
    compactMode ? height * 0.075 : height * 0.048,
    compactMode ? 22 : 28,
    compactMode ? 34 : 48,
  )

  const itemLayouts: ChecklistItemLayout[] = items.map((text, index) => {
    const { lines, truncated } = wrapTextToLines(text, charsPerLine, maxLinesPerItem)
    return {
      index: index + 1,
      text,
      lines,
      truncated,
      rowHeightPx,
      fontSizePx: listFontSizePx,
    }
  })

  const anyTruncated = itemLayouts.some((i) => i.truncated)
  const multiLineItems = itemLayouts.filter((i) => i.lines.length > 1).length

  let crampedRisk: ChecklistLayoutMetrics['crampedRisk'] = 'low'
  if (input.platform === 'facebook' && count === 7) {
    if (rowHeightPx < 52 || anyTruncated || listFontSizePx <= minRowFont + 1) {
      crampedRisk = 'high'
    } else if (rowHeightPx < 64 || multiLineItems >= 4) {
      crampedRisk = 'medium'
    }
  } else if (compactMode && count >= 7 && (anyTruncated || rowHeightPx < 48)) {
    crampedRisk = 'medium'
  }

  return {
    platform: input.platform,
    width,
    height,
    itemCount: count,
    titleFontSizePx,
    listFontSizePx,
    rowHeightPx,
    maxLinesPerItem,
    charsPerLine,
    listAreaHeightPx,
    anyTruncated,
    compactMode,
    crampedRisk,
    items: itemLayouts,
  }
}

function buildChecklistSvg(
  input: ChecklistLayoutInput,
  metrics: ChecklistLayoutMetrics,
  title: string,
): string {
  const { width, height } = metrics
  const brand = input.brandColor?.trim() || '#FFD100'
  const padX = Math.round(width * 0.07)
  const padTop = Math.round(height * (metrics.compactMode ? 0.06 : 0.08))

  const titleY = padTop + metrics.titleFontSizePx
  const listTop = padTop + Math.round(height * (metrics.compactMode ? 0.14 : 0.12))

  const itemBlocks = metrics.items
    .map((item, idx) => {
      const y0 = listTop + idx * (metrics.rowHeightPx + (metrics.itemCount >= 7 && metrics.compactMode ? 4 : metrics.itemCount >= 5 ? 6 : 10))
      const numX = padX
      const textX = padX + Math.round(metrics.listFontSizePx * 1.8) + 8
      const lineStep = metrics.listFontSizePx * 1.22
      const tspans = item.lines
        .map(
          (line, li) =>
            `<tspan x="${textX}" dy="${li === 0 ? metrics.listFontSizePx * 0.85 : lineStep}">${escapeXml(line)}</tspan>`,
        )
        .join('')
      return `
  <g>
    <circle cx="${numX + 14}" cy="${y0 + metrics.listFontSizePx * 0.55}" r="${Math.min(16, metrics.listFontSizePx * 0.65)}" fill="${escapeXml(brand)}"/>
    <text x="${numX + 14}" y="${y0 + metrics.listFontSizePx * 0.55}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-size="${Math.round(metrics.listFontSizePx * 0.75)}" font-weight="700" fill="#0A0A0A">${item.index}</text>
    <text x="${textX}" y="${y0}" font-family="Inter" font-size="${metrics.listFontSizePx}" fill="#FFFFFF">${tspans}</text>
  </g>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B2838"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="${padX - 8}" y="${listTop - 16}" width="${width - (padX - 8) * 2}" height="${metrics.listAreaHeightPx + 24}" rx="16" fill="#FFFFFF" fill-opacity="0.08"/>
  <text x="${padX}" y="${titleY}" font-family="Inter" font-size="${metrics.titleFontSizePx}" font-weight="700" fill="${escapeXml(brand)}">${escapeXml(title)}</text>
  ${itemBlocks}
  <text x="${padX}" y="${height - padTop}" font-family="Inter" font-size="${Math.max(12, metrics.listFontSizePx - 2)}" fill="#888888">Spike · ${metrics.itemCount} items · ${escapeXml(INFOGRAPHIC_PLATFORM_SIZES[input.platform].label)}</text>
</svg>`
}

export function renderChecklistInfographic(input: ChecklistLayoutInput): ChecklistRenderResult {
  const slice = CHECKLIST_SPIKE_ITEMS_FULL.slice(0, input.itemCount)
  const title = input.title ?? 'Electrician safety checklist'
  const partial = computeLayoutMetrics(input, slice)
  const metrics: ChecklistLayoutMetrics = {
    platform: partial.platform,
    width: partial.width,
    height: partial.height,
    itemCount: partial.itemCount,
    titleFontSizePx: partial.titleFontSizePx,
    listFontSizePx: partial.listFontSizePx,
    rowHeightPx: partial.rowHeightPx,
    maxLinesPerItem: partial.maxLinesPerItem,
    charsPerLine: partial.charsPerLine,
    listAreaHeightPx: partial.listAreaHeightPx,
    anyTruncated: partial.anyTruncated,
    compactMode: partial.compactMode,
    crampedRisk: partial.crampedRisk,
    items: partial.items,
  }

  const svg = buildChecklistSvg(input, metrics, title)

  const fonts = assertBundledSocialFontsPresent()
  if (!fonts.ok) {
    throw new Error(`Missing bundled fonts: ${fonts.missing.join(', ')}`)
  }

  const resvg = new Resvg(svg, {
    font: {
      fontFiles: bundledSocialFontPaths(),
      loadSystemFonts: false,
      defaultFontFamily: 'Inter',
    },
  })

  const png = Buffer.from(resvg.render().asPng())
  return { png, metrics }
}
