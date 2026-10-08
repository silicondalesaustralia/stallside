/**
 * Quote card hybrid overlay - centered card, decorative quote marks, customer footer.
 * Distinct from scene hero-stack and infographic list layouts.
 */

import { Resvg } from '@resvg/resvg-js'
import {
  assertBundledSocialFontsPresent,
  bundledSocialFontPaths,
} from '@/lib/social/bundledSocialFonts'
import {
  INFOGRAPHIC_PLATFORM_SIZES,
  type InfographicPlatformId,
} from '@/lib/social/infographic/checklistLayout'
import { charsPerLineForWidth, wrapTextToLines } from '@/lib/social/infographic/wrapText'
import type { QuoteCardContent } from '@/lib/social/quoteCardContent'

export interface RenderQuoteCardInput {
  platform: InfographicPlatformId
  content: QuoteCardContent
  brandColor?: string | null
  /** When true, canvas is transparent except card/scrim (photo underlay). */
  transparentBackground?: boolean
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

function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return false
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62
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

function starString(rating: number | undefined): string {
  if (!rating || rating < 1) return ''
  const n = clamp(Math.round(rating), 1, 5)
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function computeQuoteLayout(input: RenderQuoteCardInput) {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[input.platform]
  const compact = input.platform === 'facebook'
  const padOuter = Math.round(width * 0.06)
  const cardW = width - padOuter * 2
  const cardX = padOuter
  const cardPad = Math.round(width * 0.06)
  const innerW = cardW - cardPad * 2
  const maxCardH = Math.round(height * (compact ? 0.82 : 0.72))
  const minCardH = Math.round(height * (compact ? 0.38 : 0.32))

  const introLine = input.content.introLine?.trim() || ''
  const ctaLine = input.content.ctaLine?.trim() || ''
  const quoteText = input.content.quoteText.trim()
  const customerName = input.content.customerName.trim()
  const stars = starString(input.content.starRating)

  const introSize = clamp(compact ? 13 : 15, 12, 18)
  let quoteSize = clamp(compact ? height * 0.038 : height * 0.034, compact ? 16 : 22, compact ? 24 : 34)
  const nameSize = clamp(compact ? 14 : 17, 13, 20)
  const ctaSize = clamp(compact ? 12 : 14, 11, 16)
  const markSize = clamp(compact ? height * 0.14 : height * 0.12, 48, 120)
  const lineHeight = 1.35
  const quoteMaxLines = compact ? 5 : 7
  const minQuoteSize = compact ? 14 : 18

  const introH = introLine ? introSize * 1.4 + 8 : 0
  const footerH = nameSize * 1.3 + (stars ? nameSize * 0.9 : 0) + 8
  const ctaH = ctaLine ? ctaSize * 1.4 + 8 : 0
  const markBlockH = markSize * 0.55

  let quoteLines: string[] = []
  let quoteBlockH = 0
  let contentH = 0
  let cardH = maxCardH

  for (let attempt = 0; attempt < 8; attempt++) {
    const quoteCpl = charsPerLineForWidth(innerW - markSize * 0.35, quoteSize)
    quoteLines = wrapTextToLines(quoteText, quoteCpl, quoteMaxLines).lines
    quoteBlockH = quoteLines.length * quoteSize * lineHeight
    contentH = introH + markBlockH + quoteBlockH + footerH + ctaH + 24
    cardH = clamp(contentH + cardPad * 2, minCardH, maxCardH)

    if (contentH + cardPad * 2 <= maxCardH) break
    if (quoteSize <= minQuoteSize) break
    quoteSize = Math.max(minQuoteSize, quoteSize - 2)
  }

  const cardY = Math.round((height - cardH) / 2)
  let cursorY = cardY + cardPad

  const introY = introLine ? cursorY + introSize : 0
  if (introLine) cursorY += introH

  const markY = cursorY + markSize * 0.75
  cursorY += markBlockH

  const quoteTextY = cursorY + quoteSize
  cursorY += quoteBlockH + 12

  const dashW = Math.min(innerW * 0.2, 56)
  const dashX = cardX + cardPad
  const dashY = cursorY
  cursorY += 14

  const nameY = cursorY + nameSize
  cursorY += footerH

  const ctaY = ctaLine ? cursorY + ctaSize : 0

  return {
    width,
    height,
    compact,
    transparent: Boolean(input.transparentBackground),
    brand: input.brandColor?.trim() || '#FFD100',
    cardX,
    cardY,
    cardW,
    cardH,
    cardPad,
    innerW,
    introLine,
    ctaLine,
    quoteText,
    customerName,
    stars,
    introSize,
    quoteSize,
    nameSize,
    ctaSize,
    markSize,
    lineHeight,
    quoteLines,
    quoteBlockH,
    introY,
    markY,
    quoteTextY,
    dashW,
    dashX,
    dashY,
    nameY,
    ctaY,
  }
}

function buildQuoteCardSvg(input: RenderQuoteCardInput): string {
  const layout = computeQuoteLayout(input)
  const {
    width, height, compact, transparent, brand,
    cardX, cardY, cardW, cardH, cardPad,
    introLine, ctaLine, customerName, stars,
    introSize, quoteSize, nameSize, ctaSize, markSize, lineHeight,
    quoteLines, quoteBlockH,
    introY, markY, quoteTextY, dashW, dashX, dashY, nameY, ctaY,
  } = layout

  const onCardText = '#F5F5F0'
  const onCardMuted = '#C8C8BE'
  const cardFill = transparent ? 'rgba(18,18,22,0.88)' : 'rgba(22,26,34,0.96)'

  const bgLayer = transparent
    ? `<rect width="100%" height="100%" fill="#000000" fill-opacity="0.28"/>`
    : `
  <defs>
    <linearGradient id="qcBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B2838"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#qcBg)"/>`

  const quoteTspans = quoteLines
    .map((line, i) => {
      const dy = i === 0 ? 0 : quoteSize * lineHeight
      return `<tspan x="${cardX + cardPad}" dy="${dy}">${escapeXml(line)}</tspan>`
    })
    .join('')

  const introSvg = introLine
    ? `<text
    x="${width / 2}"
    y="${introY}"
    text-anchor="middle"
    font-family="Inter"
    font-size="${introSize}"
    font-weight="600"
    fill="${onCardMuted}"
    letter-spacing="0.06em"
  >${escapeXml(introLine.toUpperCase())}</text>`
    : ''

  const openMark = `<text
    x="${cardX + cardPad - 4}"
    y="${markY}"
    font-family="Georgia, serif"
    font-size="${markSize}"
    font-weight="700"
    fill="${escapeXml(brand)}"
    opacity="0.95"
  >“</text>`

  const dashSvg = `<line x1="${dashX}" y1="${dashY}" x2="${dashX + dashW}" y2="${dashY}" stroke="${escapeXml(brand)}" stroke-width="3" stroke-linecap="round"/>`

  const nameSvg = `<text
    x="${cardX + cardPad}"
    y="${nameY}"
    font-family="Inter"
    font-size="${nameSize}"
    font-weight="700"
    fill="${onCardText}"
  >${escapeXml(customerName)}</text>`

  const starsSvg = stars
    ? `<text
    x="${cardX + cardPad}"
    y="${nameY + nameSize * 1.05}"
    font-family="Inter"
    font-size="${Math.round(nameSize * 0.85)}"
    fill="${escapeXml(brand)}"
    letter-spacing="2"
  >${escapeXml(stars)}</text>`
    : ''

  const ctaSvg = ctaLine
    ? `<text
    x="${width / 2}"
    y="${ctaY}"
    text-anchor="middle"
    font-family="Inter"
    font-size="${ctaSize}"
    font-weight="600"
    fill="${isLightColor(brand) ? '#0A0A0A' : escapeXml(brand)}"
  >${escapeXml(ctaLine)}</text>`
    : ''

  const closeMark = `<text
    x="${cardX + cardW - cardPad + 8}"
    y="${quoteTextY + quoteBlockH * 0.35}"
    text-anchor="end"
    font-family="Georgia, serif"
    font-size="${Math.round(markSize * 0.65)}"
    font-weight="700"
    fill="${escapeXml(brand)}"
    opacity="0.45"
  >”</text>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgLayer}
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${Math.round(width * 0.04)}" fill="${cardFill}"/>
  ${introSvg}
  ${openMark}
  <text
    x="${cardX + cardPad}"
    y="${quoteTextY}"
    font-family="Inter"
    font-size="${quoteSize}"
    font-weight="500"
    fill="${onCardText}"
  >${quoteTspans}</text>
  ${closeMark}
  ${dashSvg}
  ${nameSvg}
  ${starsSvg}
  ${ctaSvg}
</svg>`
}

export function renderQuoteCardOverlayPng(input: RenderQuoteCardInput): Buffer {
  return renderSvgToPng(buildQuoteCardSvg(input))
}

/** Test/diagnostic helper - card height vs canvas for dynamic sizing verification. */
export function getQuoteCardLayoutMetrics(input: RenderQuoteCardInput) {
  const layout = computeQuoteLayout(input)
  const maxCardH = Math.round(layout.height * (layout.compact ? 0.82 : 0.72))
  return {
    cardH: layout.cardH,
    maxCardH,
    canvasHeight: layout.height,
    cardHeightRatio: layout.cardH / layout.height,
  }
}
