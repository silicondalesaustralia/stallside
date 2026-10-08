/**
 * Production infographic PNG renderer (resvg) for hybrid-render.
 * Supports all four presets; optional transparent canvas for photo underlay.
 */

import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import {
  assertBundledSocialFontsPresent,
  bundledSocialFontPaths,
} from '@/lib/social/bundledSocialFonts'
import {
  INFOGRAPHIC_PLATFORM_SIZES,
  type InfographicPlatformId,
} from '@/lib/social/infographic/checklistLayout'
import { charsPerLineForWidth, wrapTextToLines } from '@/lib/social/infographic/wrapText'
import type { InfographicPreset } from '@/lib/social/composeModel'
import type {
  BeforeAfterComparisonContent,
  ChecklistContent,
  DidYouKnowContent,
  InfographicContent,
  ProcessStepsContent,
} from '@/lib/social/infographicContent'
import type { PostSubtypeId } from '@/lib/social/postTaxonomy'
import {
  infographicIconSvg,
  resolveItemIcons,
} from '@/lib/social/infographic/infographicIcons'
import {
  buildInfographicBackground,
  listPanelSvg,
  resolveInfographicTheme,
  themeEyebrowLabel,
  titleHeaderSvg,
  type InfographicVisualThemeId,
  type ResolvedInfographicTheme,
} from '@/lib/social/infographic/infographicVisualTheme'

export interface RenderInfographicInput {
  preset: InfographicPreset
  platform: InfographicPlatformId
  content: InfographicContent
  brandColor?: string | null
  /** When true, outer canvas is transparent so Sharp can composite over a photo. */
  transparentBackground?: boolean
  footerLabel?: string | null
  postSubtype?: PostSubtypeId | null
  tradeId?: string | null
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

function renderSvgToPng(svg: string): Buffer {
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
  return Buffer.from(resvg.render().asPng())
}

function bgLayer(
  width: number,
  height: number,
  transparent: boolean,
  brand: string,
  theme: ResolvedInfographicTheme,
): string {
  return buildInfographicBackground(width, height, transparent, brand, theme)
}

function buildChecklistSvg(
  platform: InfographicPlatformId,
  content: ChecklistContent,
  brand: string,
  transparent: boolean,
  footerLabel: string | null,
  theme: ResolvedInfographicTheme,
  tradeId?: string | null,
): string {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[platform]
  const items = content.items
  const count = items.length
  const compactMode = platform === 'facebook' || (height <= 700 && count >= 5)
  const padX = Math.round(width * 0.07)
  const padTop = Math.round(height * (compactMode ? 0.06 : 0.08))
  const footerH = Math.round(height * 0.05)
  const titleFontSizePx = clamp(
    compactMode ? height * 0.075 : height * 0.048,
    compactMode ? 22 : 28,
    compactMode ? 34 : 48,
  )
  const eyebrow = themeEyebrowLabel(theme)
  const titleBlockH =
    Math.round(height * (compactMode ? 0.14 : 0.12)) +
    (eyebrow ? Math.round(titleFontSizePx * 0.4) : 0)
  const listTop = padTop + titleBlockH
  const listBottom = height - padTop - footerH
  const listAreaHeightPx = listBottom - listTop
  const rowGap = count >= 6 && compactMode ? 4 : count >= 5 ? 6 : 10
  const rowHeightPx = (listAreaHeightPx - rowGap * Math.max(0, count - 1)) / Math.max(1, count)
  const minRowFont = compactMode ? 11 : 13
  const maxRowFont = compactMode ? 17 : platform === 'gmb' ? 26 : 22
  let listFontSizePx = clamp(rowHeightPx * 0.38, minRowFont, maxRowFont)
  const lineHeightRatio = 1.22
  let maxLinesPerItem = Math.max(1, Math.floor(rowHeightPx / (listFontSizePx * lineHeightRatio)))
  if (maxLinesPerItem < 2 && count >= 5 && compactMode) {
    listFontSizePx = clamp(rowHeightPx / (2 * lineHeightRatio), minRowFont, maxRowFont)
    maxLinesPerItem = Math.max(1, Math.floor(rowHeightPx / (listFontSizePx * lineHeightRatio)))
  }
  const badgeSize = Math.min(38, listFontSizePx * 1.45)
  const numberColW = Math.round(badgeSize + 12)
  const contentWidth = width - padX * 2 - numberColW - 12
  const charsPerLine = charsPerLineForWidth(contentWidth, listFontSizePx)
  const titleY = padTop + titleFontSizePx + (eyebrow ? titleFontSizePx * 0.22 : 0)
  const iconKeys = resolveItemIcons(content.items, content.itemIcons, tradeId)

  const itemBlocks = items
    .map((text, idx) => {
      const { lines } = wrapTextToLines(text, charsPerLine, maxLinesPerItem)
      const y0 = listTop + idx * (rowHeightPx + rowGap)
      const textX = padX + numberColW + 8
      const lineStep = listFontSizePx * 1.22
      const iconCx = padX + badgeSize * 0.55
      const iconCy = y0 + listFontSizePx * 0.55
      const tspans = lines
        .map(
          (line, li) =>
            `<tspan x="${textX}" dy="${li === 0 ? listFontSizePx * 0.85 : lineStep}">${escapeXml(line)}</tspan>`,
        )
        .join('')
      return `
  <g>
    <rect x="${iconCx - badgeSize / 2}" y="${iconCy - badgeSize / 2}" width="${badgeSize}" height="${badgeSize}" rx="9" fill="${escapeXml(brand)}"/>
    ${infographicIconSvg(iconKeys[idx], iconCx, iconCy, badgeSize * 0.68, '#0A0A0A', 2.4)}
    <text x="${textX}" y="${y0}" font-family="Inter" font-size="${listFontSizePx}" font-weight="500" fill="#FFFFFF">${tspans}</text>
  </g>`
    })
    .join('')

  const footer =
    content.footerCta?.trim() ||
    footerLabel ||
    ''

  const panelX = padX - 8
  const panelW = width - panelX * 2

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgLayer(width, height, transparent, brand, theme)}
  ${listPanelSvg(panelX, listTop - 16, panelW, listAreaHeightPx + 24, brand, transparent, theme)}
  ${titleHeaderSvg(padX, titleY, content.title, titleFontSizePx, brand, width - padX * 2, eyebrow, theme)}
  ${itemBlocks}
  ${
    footer
      ? `<text x="${padX}" y="${height - padTop}" font-family="Inter" font-size="${Math.max(12, listFontSizePx - 2)}" font-weight="600" fill="${escapeXml(brand)}">${escapeXml(footer)}</text>`
      : ''
  }
</svg>`
}

function buildDidYouKnowSvg(
  platform: InfographicPlatformId,
  content: DidYouKnowContent,
  brand: string,
  transparent: boolean,
  theme: ResolvedInfographicTheme,
): string {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[platform]
  const padX = Math.round(width * 0.08)
  const padTop = Math.round(height * 0.12)
  const headlineSize = clamp(height * 0.06, 28, 52)
  const factSize = clamp(height * 0.035, 18, 32)
  const statSize = clamp(height * 0.14, 56, 120)
  const factWidth = width - padX * 2
  const factChars = charsPerLineForWidth(factWidth, factSize)
  const { lines: factLines } = wrapTextToLines(content.fact, factChars, 6)
  const factTspans = factLines
    .map(
      (line, li) =>
        `<tspan x="${padX}" dy="${li === 0 ? factSize : factSize * 1.3}">${escapeXml(line)}</tspan>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgLayer(width, height, transparent, brand, theme)}
  ${listPanelSvg(padX - 12, padTop - 24, width - (padX - 12) * 2, height - padTop * 2 + 24, brand, transparent, theme)}
  ${titleHeaderSvg(padX, padTop + headlineSize, content.headline, headlineSize, brand, factWidth, themeEyebrowLabel(theme), theme)}
  ${
    content.stat
      ? `<text x="${padX}" y="${padTop + headlineSize + statSize + 48}" font-family="Inter" font-size="${statSize}" font-weight="800" fill="${escapeXml(brand)}">${escapeXml(content.stat)}</text>`
      : ''
  }
  <text x="${padX}" y="${padTop + headlineSize + (content.stat ? statSize + 72 : 56)}" font-family="Inter" font-size="${factSize}" font-weight="500" fill="#F0F0F0">${factTspans}</text>
</svg>`
}

function buildBeforeAfterSvg(
  platform: InfographicPlatformId,
  content: BeforeAfterComparisonContent,
  brand: string,
  transparent: boolean,
  theme: ResolvedInfographicTheme,
): string {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[platform]
  const padX = Math.round(width * 0.05)
  const padTop = Math.round(height * 0.08)
  const titleSize = clamp(height * 0.05, 22, 42)
  const colGap = 16
  const colW = (width - padX * 2 - colGap) / 2
  const colTop = padTop + titleSize + 28
  const colH = height - colTop - padTop
  const pointSize = clamp(height * 0.028, 14, 22)

  const column = (
    x: number,
    title: string,
    points: string[],
    accent: string,
  ) => {
    const pointBlocks = points
      .map((p, i) => {
        const chars = charsPerLineForWidth(colW - 28, pointSize)
        const { lines } = wrapTextToLines(p, chars, 3)
        const y = colTop + 56 + i * (pointSize * 3.2)
        const tspans = lines
          .map(
            (line, li) =>
              `<tspan x="${x + 16}" dy="${li === 0 ? pointSize : pointSize * 1.2}">${escapeXml(line)}</tspan>`,
          )
          .join('')
        return `<text x="${x + 16}" y="${y}" font-family="Inter" font-size="${pointSize}" fill="#FFFFFF">${tspans}</text>`
      })
      .join('')
    return `
  <rect x="${x}" y="${colTop}" width="${colW}" height="${colH}" rx="16" fill="#0A0A0A" fill-opacity="${transparent ? 0.55 : 0.35}"/>
  <rect x="${x}" y="${colTop}" width="${colW}" height="8" rx="4" fill="${escapeXml(accent)}"/>
  <text x="${x + 16}" y="${colTop + 40}" font-family="Inter" font-size="${Math.round(pointSize * 1.15)}" font-weight="700" fill="${escapeXml(accent)}">${escapeXml(title)}</text>
  ${pointBlocks}`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgLayer(width, height, transparent, brand, theme)}
  ${titleHeaderSvg(padX, padTop + titleSize, content.title, titleSize, brand, width - padX * 2, themeEyebrowLabel(theme), theme)}
  ${column(padX, content.beforeTitle, content.beforePoints, '#9CA3AF')}
  ${column(padX + colW + colGap, content.afterTitle, content.afterPoints, brand)}
</svg>`
}

function buildProcessStepsSvg(
  platform: InfographicPlatformId,
  content: ProcessStepsContent,
  brand: string,
  transparent: boolean,
  theme: ResolvedInfographicTheme,
): string {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[platform]
  const padX = Math.round(width * 0.07)
  const padTop = Math.round(height * 0.08)
  const titleSize = clamp(height * 0.05, 24, 44)
  const steps = content.steps
  const areaTop = padTop + titleSize + 36
  const areaH = height - areaTop - padTop
  const rowH = areaH / Math.max(1, steps.length)
  const labelSize = clamp(rowH * 0.22, 16, 28)
  const detailSize = clamp(rowH * 0.16, 13, 22)

  const blocks = steps
    .map((step, idx) => {
      const y = areaTop + idx * rowH
      const detailChars = charsPerLineForWidth(width - padX * 2 - 70, detailSize)
      const { lines } = wrapTextToLines(step.detail, detailChars, 3)
      const tspans = lines
        .map(
          (line, li) =>
            `<tspan x="${padX + 64}" dy="${li === 0 ? detailSize : detailSize * 1.25}">${escapeXml(line)}</tspan>`,
        )
        .join('')
      return `
  <g>
    <circle cx="${padX + 22}" cy="${y + rowH * 0.35}" r="22" fill="${escapeXml(brand)}"/>
    <text x="${padX + 22}" y="${y + rowH * 0.35}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-size="18" font-weight="700" fill="#0A0A0A">${idx + 1}</text>
    <text x="${padX + 64}" y="${y + rowH * 0.28}" font-family="Inter" font-size="${labelSize}" font-weight="700" fill="#FFFFFF">${escapeXml(step.label)}</text>
    <text x="${padX + 64}" y="${y + rowH * 0.28 + 8}" font-family="Inter" font-size="${detailSize}" fill="#DDDDDD">${tspans}</text>
  </g>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgLayer(width, height, transparent, brand, theme)}
  ${listPanelSvg(padX - 8, areaTop - 20, width - (padX - 8) * 2, areaH + 28, brand, transparent, theme)}
  ${titleHeaderSvg(padX, padTop + titleSize, content.title, titleSize, brand, width - padX * 2, themeEyebrowLabel(theme), theme)}
  ${blocks}
</svg>`
}

function resolveThemeFromInput(input: RenderInfographicInput): ResolvedInfographicTheme {
  const contentTheme =
    input.content && typeof input.content === 'object' && 'visualTheme' in input.content
      ? (input.content as { visualTheme?: InfographicVisualThemeId | null }).visualTheme
      : null
  return resolveInfographicTheme({
    visualTheme: contentTheme,
    postSubtype: input.postSubtype,
  })
}

export function renderInfographicOverlayPng(input: RenderInfographicInput): Buffer {
  const brand = input.brandColor?.trim() || '#FFD100'
  const transparent = Boolean(input.transparentBackground)
  const footer = input.footerLabel ?? null
  const theme = resolveThemeFromInput(input)
  let svg: string

  switch (input.preset) {
    case 'checklist':
      svg = buildChecklistSvg(
        input.platform,
        input.content as ChecklistContent,
        brand,
        transparent,
        footer,
        theme,
        input.tradeId,
      )
      break
    case 'did_you_know':
      svg = buildDidYouKnowSvg(
        input.platform,
        input.content as DidYouKnowContent,
        brand,
        transparent,
        theme,
      )
      break
    case 'before_after_comparison':
      svg = buildBeforeAfterSvg(
        input.platform,
        input.content as BeforeAfterComparisonContent,
        brand,
        transparent,
        theme,
      )
      break
    case 'process_steps':
      svg = buildProcessStepsSvg(
        input.platform,
        input.content as ProcessStepsContent,
        brand,
        transparent,
        theme,
      )
      break
    default:
      throw new Error(`Unsupported preset: ${input.preset}`)
  }

  return renderSvgToPng(svg)
}

/** Full hybrid composite: optional photo underlay + infographic SVG + later logo via sharp. */
export async function resizeHybridPhotoBackground(
  photoBuffer: Buffer,
  platform: InfographicPlatformId,
): Promise<Buffer> {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[platform]
  return sharp(photoBuffer)
    .rotate()
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .png()
    .toBuffer()
}

export async function compositeInfographicOnPhoto(opts: {
  overlayPng: Buffer
  platform: InfographicPlatformId
  photoBuffer?: Buffer | null
  /** Pre-resized photo at canvas dimensions - skips rotate/resize when set. */
  photoBase?: Buffer | null
}): Promise<Buffer> {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[opts.platform]

  if (!opts.photoBuffer && !opts.photoBase) {
    return sharp(opts.overlayPng).resize(width, height).png().toBuffer()
  }

  const base =
    opts.photoBase ??
    (await resizeHybridPhotoBackground(opts.photoBuffer!, opts.platform))

  return sharp(base)
    .composite([{ input: opts.overlayPng, top: 0, left: 0 }])
    .png()
    .toBuffer()
}
