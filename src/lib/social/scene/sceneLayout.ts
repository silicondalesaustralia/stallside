/**
 * Shared scene hero-stack layout - used by renderScene and contrast sampling.
 */

import {
  INFOGRAPHIC_PLATFORM_SIZES,
  type InfographicPlatformId,
} from '@/lib/social/infographic/platformSizes'
import { charsPerLineForWidth, wrapTextToLines } from '@/lib/social/infographic/wrapText'
import type { SceneContent } from '@/lib/social/sceneContent'
import {
  DEFAULT_SCENE_STACK_LAYOUT,
  parseSceneStackLayout,
  stackHorizontal,
  stackVertical,
  type SceneStackLayout,
} from '@/lib/social/sceneStackLayout'

export interface SceneRect {
  x: number
  y: number
  w: number
  h: number
}

export type SceneTextAnchor = 'start' | 'middle' | 'end'
export type SceneScrimEdge = 'top' | 'bottom'

export interface SceneLayout {
  width: number
  height: number
  compact: boolean
  padX: number
  bottomPad: number
  contentW: number
  scrimY: number
  scrimH: number
  scrimEdge: SceneScrimEdge
  headlineBox: SceneRect
  taglineBox: SceneRect | null
  ctaBox: SceneRect
  heroStackBox: SceneRect
  headlineLines: string[]
  taglineLines: string[]
  headlineSize: number
  taglineSize: number
  ctaFontSize: number
  lineHeight: number
  textX: number
  textAnchor: SceneTextAnchor
  headlineBaselineY: number
  taglineBaselineY: number
  pillTextY: number
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52
}

function unionRects(a: SceneRect, b: SceneRect): SceneRect {
  const x1 = Math.min(a.x, b.x)
  const y1 = Math.min(a.y, b.y)
  const x2 = Math.max(a.x + a.w, b.x + b.w)
  const y2 = Math.max(a.y + a.h, b.y + b.h)
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

export function lineUnderlineX(
  textX: number,
  line: string,
  fontSize: number,
  anchor: SceneTextAnchor,
): number {
  const w = Math.max(8, Math.round(estimateTextWidth(line, fontSize)))
  if (anchor === 'middle') return Math.round(textX - w / 2)
  if (anchor === 'end') return Math.round(textX - w)
  return Math.round(textX)
}

export function computeSceneLayout(input: {
  platform: InfographicPlatformId
  content: SceneContent
  stack?: Partial<SceneStackLayout> | null
}): SceneLayout {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[input.platform]
  const compact = input.platform === 'facebook'
  const stack = parseSceneStackLayout({ ...DEFAULT_SCENE_STACK_LAYOUT, ...input.stack })
  const vertical = stackVertical(stack.stackAnchor)
  const horizontal = stackHorizontal(stack.stackAnchor)
  const padX = Math.round(width * 0.07)
  const edgePad = Math.round(height * (compact ? 0.06 : 0.09))
  const contentW = width - padX * 2

  const headlineSize = clamp(
    compact ? height * 0.11 : height * 0.052,
    compact ? 22 : 28,
    compact ? 36 : 52,
  )
  const taglineSize = clamp(
    compact ? height * 0.042 : height * 0.028,
    compact ? 14 : 16,
    compact ? 22 : 28,
  )

  const headlineMaxLines = compact ? 2 : 3
  const taglineMaxLines = compact ? 1 : 2
  const lineHeight = 1.2
  const blockGap = Math.round(headlineSize * 0.35)

  const ctaText = input.content.cta.trim()
  const ctaFontSize = clamp(compact ? 15 : 18, 14, 22)
  const pillPadX = Math.round(ctaFontSize * 0.85)
  const pillPadY = Math.round(ctaFontSize * 0.45)
  const pillTextW = estimateTextWidth(ctaText, ctaFontSize)
  const pillW = Math.min(contentW, Math.round(pillTextW + pillPadX * 2))
  const pillH = Math.round(ctaFontSize + pillPadY * 2)

  let taglineLines: string[] = []
  if (input.content.tagline.trim()) {
    const cpl = charsPerLineForWidth(contentW, taglineSize)
    taglineLines = wrapTextToLines(input.content.tagline.trim(), cpl, taglineMaxLines).lines
  }

  const headlineCpl = charsPerLineForWidth(contentW, headlineSize)
  const headlineLines = wrapTextToLines(
    input.content.headline.trim(),
    headlineCpl,
    headlineMaxLines,
  ).lines

  const headlineBlockH = headlineLines.length * headlineSize * lineHeight
  const taglineBlockH = taglineLines.length * taglineSize * lineHeight
  const stackH =
    headlineBlockH +
    (taglineLines.length > 0 ? blockGap + taglineBlockH : 0) +
    blockGap +
    pillH

  const offsetXpx = Math.round((width * stack.stackOffsetX) / 100)
  const offsetYpx = Math.round((height * stack.stackOffsetY) / 100)

  let stackTop =
    vertical === 'top' ? edgePad + offsetYpx : height - edgePad - stackH + offsetYpx
  const minTop = edgePad
  const maxTop = height - edgePad - stackH
  stackTop = clamp(stackTop, minTop, Math.max(minTop, maxTop))

  const headlineTop = stackTop
  const headlineBaselineY = headlineTop + headlineSize
  let cursor = headlineTop + headlineBlockH + blockGap

  let taglineTop = cursor
  let taglineBaselineY = cursor
  if (taglineLines.length > 0) {
    taglineTop = cursor
    taglineBaselineY = taglineTop + taglineSize
    cursor = taglineTop + taglineBlockH + blockGap
  }

  const pillTop = cursor
  const pillTextY = pillTop + pillH / 2 + ctaFontSize * 0.35

  const textAnchor: SceneTextAnchor =
    horizontal === 'left' ? 'start' : horizontal === 'right' ? 'end' : 'middle'

  let textX =
    horizontal === 'left'
      ? padX
      : horizontal === 'right'
        ? width - padX
        : Math.round(width / 2)
  textX += offsetXpx

  let ctaX =
    horizontal === 'left'
      ? textX
      : horizontal === 'right'
        ? textX - pillW
        : textX - pillW / 2

  const minX = padX
  const maxCtaX = width - padX - pillW
  ctaX = clamp(ctaX, minX, Math.max(minX, maxCtaX))

  if (horizontal === 'left') textX = ctaX
  else if (horizontal === 'right') textX = ctaX + pillW
  else textX = Math.round(ctaX + pillW / 2)

  const ctaBox: SceneRect = { x: ctaX, y: pillTop, w: pillW, h: pillH }

  const headlineBox: SceneRect = {
    x: padX,
    y: headlineTop,
    w: contentW,
    h: headlineBlockH,
  }

  let taglineBox: SceneRect | null = null
  if (taglineLines.length > 0) {
    taglineBox = {
      x: padX,
      y: taglineTop,
      w: contentW,
      h: taglineBlockH,
    }
  }

  let heroStackBox = unionRects(headlineBox, ctaBox)
  if (taglineBox) {
    heroStackBox = unionRects(heroStackBox, taglineBox)
  }

  const pad = 8
  const heroX = Math.max(0, heroStackBox.x - pad)
  const heroY = Math.max(0, heroStackBox.y - pad)
  heroStackBox = {
    x: heroX,
    y: heroY,
    w: Math.min(width - heroX, heroStackBox.w + pad * 2),
    h: Math.min(height - heroY, heroStackBox.h + pad * 2),
  }

  const scrimEdge: SceneScrimEdge = vertical
  const scrimH = Math.round(height * (compact ? 0.72 : 0.58))
  const scrimY = scrimEdge === 'bottom' ? height - scrimH : 0

  return {
    width,
    height,
    compact,
    padX,
    bottomPad: edgePad,
    contentW,
    scrimY,
    scrimH,
    scrimEdge,
    headlineBox,
    taglineBox,
    ctaBox,
    heroStackBox,
    headlineLines,
    taglineLines,
    headlineSize,
    taglineSize,
    ctaFontSize,
    lineHeight,
    textX,
    textAnchor,
    headlineBaselineY,
    taglineBaselineY,
    pillTextY,
  }
}
