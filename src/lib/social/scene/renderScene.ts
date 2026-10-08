/**
 * Scene-style hybrid overlay - hero stack (headline / tagline / CTA pill).
 */

import { Resvg } from '@resvg/resvg-js'
import {
  assertBundledSocialFontsPresent,
  bundledSocialFontPaths,
} from '@/lib/social/bundledSocialFonts'
import type { InfographicPlatformId } from '@/lib/social/infographic/platformSizes'
import {
  DEFAULT_SCRIM_PROFILE,
  type ScrimProfile,
} from '@/lib/social/scene/sceneContrast'
import { computeSceneLayout, lineUnderlineX } from '@/lib/social/scene/sceneLayout'
import type { SceneContent } from '@/lib/social/sceneContent'
import type { SceneStackLayout } from '@/lib/social/sceneStackLayout'
import type { SocialElementStyle, SocialTextStyles } from '@/lib/social/socialTextStyle'
import { styleBold, styleItalic, styleUnderline } from '@/lib/social/socialTextStyle'
import { isLightColor } from '@/lib/utils/colorContrast'

const HEAVY_DISPLAY_FAMILIES = new Set(['Anton', 'Bebas Neue', 'Oswald', 'Fjalla One'])

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52
}

function emphasisTextAttrs(
  style: SocialElementStyle,
  element: 'headline' | 'tagline',
  fill: string,
  fontSize: number,
): string {
  const bold = styleBold(style, element)
  const italic = styleItalic(style)
  const weight = bold ? 700 : 400
  const fontStyle = italic ? 'italic' : 'normal'
  const alreadyHeavy = HEAVY_DISPLAY_FAMILIES.has(style.fontFamily)
  const stroke =
    bold && !alreadyHeavy
      ? ` stroke="${escapeXml(fill)}" stroke-width="${Math.max(0.5, fontSize * 0.025)}" paint-order="stroke fill"`
      : ''
  return `font-weight="${weight}" font-style="${fontStyle}"${stroke}`
}

function underlineMarks(
  lines: string[],
  startY: number,
  fontSize: number,
  textX: number,
  textAnchor: 'start' | 'middle' | 'end',
  lineHeight: number,
  color: string,
): string {
  const thickness = Math.max(2, Math.round(fontSize * 0.06))
  return lines
    .map((line, i) => {
      const y = startY + i * fontSize * lineHeight + Math.round(fontSize * 0.12)
      const x = lineUnderlineX(textX, line, fontSize, textAnchor)
      const w = Math.max(8, Math.round(estimateTextWidth(line, fontSize)))
      return `<rect x="${x}" y="${y}" width="${w}" height="${thickness}" fill="${escapeXml(color)}"/>`
    })
    .join('')
}

function wrapItalic(x: number, y: number, italic: boolean, inner: string): string {
  if (!italic) return inner
  return `<g transform="translate(${x} ${y}) skewX(-11) translate(${-x} ${-y})">${inner}</g>`
}

export type { ScrimProfile }

export interface RenderSceneInput {
  platform: InfographicPlatformId
  content: SceneContent
  textStyles: SocialTextStyles
  brandColor?: string | null
  /** When true, canvas is transparent except edge scrim (photo underlay). */
  transparentBackground?: boolean
  /** Adaptive scrim stops (photo mode). Defaults to fixed gradient when omitted. */
  scrimProfile?: ScrimProfile
  stack?: Partial<SceneStackLayout> | null
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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

function opaqueBackground(width: number, height: number): string {
  return `
  <defs>
    <linearGradient id="sceneBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B2838"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sceneBg)"/>`
}

function edgeScrim(
  width: number,
  height: number,
  scrimY: number,
  scrimH: number,
  edge: 'top' | 'bottom',
  profile: ScrimProfile = DEFAULT_SCRIM_PROFILE,
): string {
  const mid = profile.stopMidOpacity
  const bottom = profile.stopBottomOpacity
  const stops =
    edge === 'bottom'
      ? `<stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="35%" stop-color="#000000" stop-opacity="${mid}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="${bottom}"/>`
      : `<stop offset="0%" stop-color="#000000" stop-opacity="${bottom}"/>
      <stop offset="65%" stop-color="#000000" stop-opacity="${mid}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>`
  return `
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      ${stops}
    </linearGradient>
  </defs>
  <rect x="0" y="${scrimY}" width="${width}" height="${scrimH}" fill="url(#scrim)"/>`
}

function buildSceneSvg(input: RenderSceneInput): string {
  const layout = computeSceneLayout({
    platform: input.platform,
    content: input.content,
    stack: input.stack ?? input.textStyles,
  })
  const {
    width,
    height,
    textX,
    textAnchor,
    headlineLines,
    taglineLines,
    headlineSize,
    taglineSize,
    lineHeight,
    headlineBaselineY,
    taglineBaselineY,
    ctaBox,
    ctaFontSize,
    pillTextY,
    scrimY,
    scrimH,
    scrimEdge,
  } = layout

  const transparent = Boolean(input.transparentBackground)
  const brand = input.brandColor?.trim() || '#FFD100'
  const pillTextColor = isLightColor(brand) ? '#0A0A0A' : '#FFFFFF'

  const headlineStyle = input.textStyles.headline
  const taglineStyle = input.textStyles.tagline

  const headlineTspans = headlineLines
    .map((line, i) => {
      const dy = i === 0 ? 0 : headlineSize * lineHeight
      return `<tspan x="${textX}" dy="${dy}">${escapeXml(line)}</tspan>`
    })
    .join('')

  const taglineTspans = taglineLines
    .map((line, i) => {
      const dy = i === 0 ? 0 : taglineSize * lineHeight
      return `<tspan x="${textX}" dy="${dy}">${escapeXml(line)}</tspan>`
    })
    .join('')

  const bg = transparent
    ? edgeScrim(width, height, scrimY, scrimH, scrimEdge, input.scrimProfile)
    : opaqueBackground(width, height)

  const headlineFill = headlineStyle.color
  const taglineFill = taglineStyle.color
  const headlineBlock = wrapItalic(
    textX,
    headlineBaselineY,
    styleItalic(headlineStyle),
    `<text
    x="${textX}"
    y="${headlineBaselineY}"
    text-anchor="${textAnchor}"
    font-family="${escapeXml(headlineStyle.fontFamily)}"
    font-size="${headlineSize}"
    ${emphasisTextAttrs(headlineStyle, 'headline', headlineFill, headlineSize)}
    fill="${escapeXml(headlineFill)}"
  >${headlineTspans}</text>${
    styleUnderline(headlineStyle)
      ? underlineMarks(
          headlineLines,
          headlineBaselineY,
          headlineSize,
          textX,
          textAnchor,
          lineHeight,
          headlineFill,
        )
      : ''
  }`,
  )
  const taglineBlock =
    taglineLines.length > 0
      ? wrapItalic(
          textX,
          taglineBaselineY,
          styleItalic(taglineStyle),
          `<text
    x="${textX}"
    y="${taglineBaselineY}"
    text-anchor="${textAnchor}"
    font-family="${escapeXml(taglineStyle.fontFamily)}"
    font-size="${taglineSize}"
    ${emphasisTextAttrs(taglineStyle, 'tagline', taglineFill, taglineSize)}
    fill="${escapeXml(taglineFill)}"
  >${taglineTspans}</text>${
    styleUnderline(taglineStyle)
      ? underlineMarks(
          taglineLines,
          taglineBaselineY,
          taglineSize,
          textX,
          textAnchor,
          lineHeight,
          taglineFill,
        )
      : ''
  }`,
        )
      : ''

  const ctaText = input.content.cta.trim()

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bg}
  ${headlineBlock}
  ${taglineBlock}
  <rect x="${ctaBox.x}" y="${ctaBox.y}" width="${ctaBox.w}" height="${ctaBox.h}" rx="${Math.round(ctaBox.h / 2)}" fill="${escapeXml(brand)}"/>
  <text
    x="${ctaBox.x + ctaBox.w / 2}"
    y="${pillTextY}"
    text-anchor="middle"
    font-family="Inter"
    font-size="${ctaFontSize}"
    font-weight="700"
    fill="${pillTextColor}"
  >${escapeXml(ctaText)}</text>
</svg>`
}

export function renderSceneOverlayPng(input: RenderSceneInput): Buffer {
  const svg = buildSceneSvg(input)
  return renderSvgToPng(svg)
}
