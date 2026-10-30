import type { VideoHeadlineFontId } from '../videoBranding/types'
import { normalizeHexColor, parseVideoFont } from './captionStyles'

export type TextOverlayStyle = 'plain' | 'outline' | 'box'

/** On-screen text shown between s and e (seconds of the caption-free clip). */
export type TextOverlay = {
  id: string
  s: number
  e: number
  text: string
  /** Centre of the text, 0–1 across / down the frame. */
  x: number
  y: number
  font: VideoHeadlineFontId
  /** Font size as a percentage of the frame's shorter side. */
  size: number
  bold: boolean
  color: string
  /** Outline colour for 'outline', box colour for 'box'. */
  accent: string
  style: TextOverlayStyle
}

export const MAX_OVERLAYS = 20
export const MAX_OVERLAY_CHARS = 120
export const OVERLAY_SIZE_RANGE = { min: 3, max: 18 }
const MIN_OVERLAY_SECONDS = 0.2
const NEW_OVERLAY_SECONDS = 3

export const OVERLAY_STYLE_OPTIONS: { id: TextOverlayStyle; label: string }[] = [
  { id: 'outline', label: 'Outline' },
  { id: 'box', label: 'Box' },
  { id: 'plain', label: 'Plain' },
]

const round = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)

export function newOverlayAt(t: number, duration: number): TextOverlay {
  const s = clamp(t, 0, Math.max(0, duration - MIN_OVERLAY_SECONDS))
  return {
    id: `ov-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    s: round(s),
    e: round(Math.min(duration, s + NEW_OVERLAY_SECONDS)),
    text: 'Your text',
    x: 0.5,
    y: 0.3,
    font: 'anton',
    size: 9,
    bold: true,
    color: '#FFFFFF',
    accent: '#000000',
    style: 'outline',
  }
}

function parseOverlay(raw: unknown, maxSeconds: number, index: number): TextOverlay | null {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null
  if (!r) return null
  const text = typeof r.text === 'string' ? r.text.replace(/[{}\\]/g, '').trim().slice(0, MAX_OVERLAY_CHARS) : ''
  const s = clamp(Number(r.s), 0, maxSeconds)
  const e = clamp(Number(r.e), 0, maxSeconds)
  if (!text || !Number.isFinite(s) || !Number.isFinite(e) || e - s < MIN_OVERLAY_SECONDS) return null
  const size = Number(r.size)
  const x = Number(r.x)
  const y = Number(r.y)
  const style = OVERLAY_STYLE_OPTIONS.some((o) => o.id === r.style) ? (r.style as TextOverlayStyle) : 'outline'
  return {
    id: typeof r.id === 'string' && r.id ? r.id.slice(0, 40) : `ov-${index}`,
    s: round(s),
    e: round(e),
    text,
    x: Number.isFinite(x) ? clamp(x, 0, 1) : 0.5,
    y: Number.isFinite(y) ? clamp(y, 0, 1) : 0.3,
    font: parseVideoFont(r.font),
    size: Number.isFinite(size) ? clamp(size, OVERLAY_SIZE_RANGE.min, OVERLAY_SIZE_RANGE.max) : 9,
    bold: r.bold !== false,
    color: normalizeHexColor(r.color) ?? '#FFFFFF',
    accent: normalizeHexColor(r.accent) ?? '#000000',
    style,
  }
}

export function sanitizeOverlays(value: unknown, maxSeconds: number): TextOverlay[] {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, MAX_OVERLAYS)
    .map((raw, i) => parseOverlay(raw, maxSeconds, i))
    .filter((o): o is TextOverlay => o !== null)
}

/** Moves or resizes an overlay's time range by delta seconds (overlays may overlap each other). */
export function dragOverlayTime(
  overlay: TextOverlay,
  mode: 'move' | 'start' | 'end',
  delta: number,
  duration: number,
): TextOverlay {
  let { s, e } = overlay
  if (mode === 'move') {
    const len = e - s
    s = clamp(s + delta, 0, Math.max(0, duration - len))
    e = s + len
  } else if (mode === 'start') {
    s = clamp(s + delta, 0, e - MIN_OVERLAY_SECONDS)
  } else {
    e = clamp(e + delta, s + MIN_OVERLAY_SECONDS, duration)
  }
  return { ...overlay, s: round(s), e: round(e) }
}
