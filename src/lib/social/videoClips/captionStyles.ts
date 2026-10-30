import { isVideoHeadlineFontId } from '../videoBranding/videoHeadlineFontCatalog'
import type { VideoHeadlineFontId } from '../videoBranding/types'

export type CaptionStyleId = 'bold' | 'boxed' | 'minimal' | 'none'
/** Clip-job column values (DB check constraint) — the editor also allows `top`. */
export type CaptionPosition = 'bottom' | 'middle'
export type CaptionPlacement = CaptionPosition | 'top'
export type CaptionLook = 'outline' | 'box' | 'shadow' | 'plain'

export type CaptionSettings = {
  /** Preset the details started from; `none` hides captions. */
  style: CaptionStyleId
  position: CaptionPlacement
  /** Hex like #FFD100. Null = business brand colour. */
  highlightColor: string | null
  font: VideoHeadlineFontId
  /** Font size as % of the frame's shorter side. */
  size: number
  bold: boolean
  uppercase: boolean
  textColor: string
  /** Outline colour, or box colour for the `box` look. */
  accentColor: string
  look: CaptionLook
  /** Box opacity %, `box` look only. */
  boxOpacity: number
  /** Colour each word as it is spoken. */
  wordHighlight: boolean
}

type CaptionDetails = Omit<CaptionSettings, 'style' | 'position' | 'highlightColor' | 'font'>

const PRESET_DETAILS: Record<Exclude<CaptionStyleId, 'none'>, CaptionDetails> = {
  bold: { size: 8.5, bold: true, uppercase: true, textColor: '#FFFFFF', accentColor: '#000000', look: 'outline', boxOpacity: 65, wordHighlight: true },
  boxed: { size: 6.5, bold: true, uppercase: false, textColor: '#FFFFFF', accentColor: '#000000', look: 'box', boxOpacity: 65, wordHighlight: false },
  minimal: { size: 5.5, bold: false, uppercase: false, textColor: '#FFFFFF', accentColor: '#000000', look: 'shadow', boxOpacity: 65, wordHighlight: false },
}

export function captionPresetDetails(style: CaptionStyleId): CaptionDetails {
  return PRESET_DETAILS[style === 'none' ? 'bold' : style]
}

export const CAPTION_SIZE_RANGE = { min: 3, max: 14 }

export const CAPTION_LOOK_OPTIONS: { id: CaptionLook; label: string }[] = [
  { id: 'outline', label: 'Outline' },
  { id: 'box', label: 'Box behind text' },
  { id: 'shadow', label: 'Drop shadow' },
  { id: 'plain', label: 'Plain' },
]

export const CAPTION_PLACEMENT_OPTIONS: { id: CaptionPlacement; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'middle', label: 'Middle' },
  { id: 'bottom', label: 'Bottom' },
]

export function parseVideoFont(value: unknown): VideoHeadlineFontId {
  return typeof value === 'string' && isVideoHeadlineFontId(value) ? value : 'inter'
}

export const CAPTION_STYLE_OPTIONS: { id: CaptionStyleId; label: string }[] = [
  { id: 'bold', label: 'Bold — word-by-word highlight' },
  { id: 'boxed', label: 'Boxed — text on dark box' },
  { id: 'minimal', label: 'Minimal — small and clean' },
  { id: 'none', label: 'No captions' },
]

export const CAPTION_POSITION_OPTIONS: { id: CaptionPosition; label: string }[] = [
  { id: 'bottom', label: 'Bottom' },
  { id: 'middle', label: 'Middle' },
]

export const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  style: 'bold',
  position: 'bottom',
  highlightColor: null,
  font: 'inter',
  ...PRESET_DETAILS.bold,
}

export const FALLBACK_HIGHLIGHT_COLOR = '#FFD100'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return HEX_RE.test(trimmed) ? trimmed.toUpperCase() : null
}

export function parseCaptionStyle(value: unknown): CaptionStyleId {
  return CAPTION_STYLE_OPTIONS.some((o) => o.id === value) ? (value as CaptionStyleId) : 'bold'
}

export function parseCaptionPosition(value: unknown): CaptionPosition {
  return value === 'middle' ? 'middle' : 'bottom'
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10
}

/** Missing detail fields (older saved clips) fall back to the preset, so their look is unchanged. */
export function parseCaptionSettings(input: unknown): CaptionSettings {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  const style = parseCaptionStyle(raw.style)
  const base = captionPresetDetails(style)
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)
  return {
    style,
    position: raw.position === 'top' ? 'top' : parseCaptionPosition(raw.position),
    highlightColor: normalizeHexColor(raw.highlightColor),
    font: parseVideoFont(raw.font),
    size: clampNumber(raw.size, CAPTION_SIZE_RANGE.min, CAPTION_SIZE_RANGE.max, base.size),
    bold: bool(raw.bold, base.bold),
    uppercase: bool(raw.uppercase, base.uppercase),
    textColor: normalizeHexColor(raw.textColor) ?? base.textColor,
    accentColor: normalizeHexColor(raw.accentColor) ?? base.accentColor,
    look: CAPTION_LOOK_OPTIONS.some((o) => o.id === raw.look) ? (raw.look as CaptionLook) : base.look,
    boxOpacity: clampNumber(raw.boxOpacity, 10, 100, base.boxOpacity),
    wordHighlight: bool(raw.wordHighlight, base.wordHighlight),
  }
}

export function resolveHighlightColor(settings: CaptionSettings, brandColor: string | null): string {
  return settings.highlightColor ?? normalizeHexColor(brandColor) ?? FALLBACK_HIGHLIGHT_COLOR
}
