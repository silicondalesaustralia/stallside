import type { CSSProperties } from 'react'
import type { CaptionSettings } from '@/lib/social/videoClips/captionStyles'
import { videoFontCss } from './videoFontCss'

function withOpacity(hex: string, opacityPercent: number): string {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacityPercent / 100})`
}

/** Mirrors captionAss.ts sizing (font size = % of the shorter side → `cqmin`). */
export function captionPreviewCss(s: CaptionSettings): CSSProperties {
  const base: CSSProperties = {
    fontFamily: videoFontCss(s.font),
    fontSize: `${s.size}cqmin`,
    fontWeight: s.bold ? 800 : 400,
    color: s.textColor,
    textTransform: s.uppercase ? 'uppercase' : 'none',
    lineHeight: 1.15,
  }
  if (s.look === 'box') {
    return { ...base, background: withOpacity(s.accentColor, s.boxOpacity), padding: `${s.size * 0.2}cqmin ${s.size * 0.3}cqmin`, borderRadius: '0.6cqmin', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }
  }
  if (s.look === 'outline') {
    return { ...base, WebkitTextStroke: `${Math.max(0.3, s.size * 0.18)}cqmin ${s.accentColor}`, paintOrder: 'stroke fill' }
  }
  if (s.look === 'shadow') {
    return { ...base, textShadow: `0 ${s.size * 0.05}cqmin ${s.size * 0.06}cqmin rgba(0,0,0,0.85)` }
  }
  return base
}

export function captionPlacementClass(s: CaptionSettings): string {
  if (s.position === 'top') return 'top-[10%]'
  if (s.position === 'middle') return 'top-1/2 -translate-y-1/2'
  return 'bottom-[14%]'
}

/** Approximate the spoken word from progress through the cue (the editor has no per-word timings). */
export function highlightedWordIndex(text: string, progress: number): number {
  const count = text.trim().split(/\s+/).filter(Boolean).length
  if (count === 0) return -1
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)))
}
