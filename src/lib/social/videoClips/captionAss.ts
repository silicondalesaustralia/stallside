import { videoHeadlineFontLabel } from '../videoBranding/videoHeadlineFontCatalog'
import { wordsForCue, type CaptionCue } from './captionCues'
import type { CaptionSettings } from './captionStyles'
import { overlayEvents, overlayStyleLines } from './overlayAss'
import type { TextOverlay } from './textOverlays'
import type { TranscriptWord } from './types'

/** ASS inline override colour: &HBBGGRR& (styles use &HAABBGGRR). */
export function hexToAssOverrideColor(hex: string): string {
  const clean = hex.replace('#', '')
  return `&H${clean.slice(4, 6)}${clean.slice(2, 4)}${clean.slice(0, 2)}&`.toUpperCase()
}

export function assTime(seconds: number): string {
  const cs = Math.max(0, Math.round(seconds * 100))
  const h = Math.floor(cs / 360000)
  const m = Math.floor((cs % 360000) / 6000)
  const s = Math.floor((cs % 6000) / 100)
  const c = cs % 100
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${h}:${pad(m)}:${pad(s)}.${pad(c)}`
}

function escapeText(text: string): string {
  return text.replace(/[{}\\]/g, '').replace(/\s+/g, ' ').trim()
}

/** Style colour &HAABBGGRR, where AA is transparency (00 = opaque). */
function hexToAssStyleColor(hex: string, opacityPercent = 100): string {
  const alpha = Math.round(255 * (1 - Math.min(100, Math.max(0, opacityPercent)) / 100))
  const clean = hex.replace('#', '')
  const aa = alpha.toString(16).padStart(2, '0')
  return `&H${aa}${clean.slice(4, 6)}${clean.slice(2, 4)}${clean.slice(0, 2)}`.toUpperCase()
}

function styleLine(settings: CaptionSettings, width: number, height: number): string {
  const minDim = Math.min(width, height)
  const marginLR = Math.round(width * 0.08)
  const edge = Math.round(height * (height > width ? 0.16 : 0.08))
  const alignment = settings.position === 'middle' ? 5 : settings.position === 'top' ? 8 : 2
  const marginV = settings.position === 'middle' ? 0 : settings.position === 'top' ? Math.round(height * 0.1) : edge
  const size = Math.max(8, Math.round((settings.size / 100) * minDim))
  const box = settings.look === 'box'
  const outline = box
    ? Math.round(size * 0.3)
    : settings.look === 'outline'
      ? Math.max(2, Math.round(size * 0.09))
      : settings.look === 'shadow'
        ? Math.max(1, Math.round(size * 0.03))
        : 0
  const shadow = settings.look === 'shadow' ? Math.max(2, Math.round(size * 0.05)) : 0
  const text = hexToAssStyleColor(settings.textColor)
  const accent = hexToAssStyleColor(settings.accentColor, box ? settings.boxOpacity : 100)

  return [
    `Style: Caption,${videoHeadlineFontLabel(settings.font)}`,
    size,
    text,
    text,
    accent,
    '&H80000000',
    settings.bold ? -1 : 0,
    0, 0, 0, 100, 100, 0, 0,
    box ? 3 : 1,
    outline,
    shadow,
    alignment,
    marginLR,
    marginLR,
    marginV,
    1,
  ].join(',')
}

function caseText(text: string, settings: CaptionSettings): string {
  const clean = escapeText(text)
  return settings.uppercase ? clean.toUpperCase() : clean
}

function dialogue(start: number, end: number, text: string): string {
  return `Dialogue: 0,${assTime(start)},${assTime(end)},Caption,,0,0,0,,${text}`
}

function highlightEvents(cue: CaptionCue, words: TranscriptWord[], highlight: string, settings: CaptionSettings): string[] {
  const ws = wordsForCue(cue, words)
  if (!ws.length) return [dialogue(cue.s, cue.e, caseText(cue.text, settings))]
  const tokens = ws.map((w) => caseText(w.w, settings))
  const base = hexToAssOverrideColor(settings.textColor)
  return ws.flatMap((w, i) => {
    const start = i === 0 ? cue.s : w.s
    const end = i === ws.length - 1 ? cue.e : ws[i + 1].s
    if (end <= start) return []
    const text = tokens.map((t, j) => (j === i ? `{\\c${highlight}}${t}{\\c${base}}` : t)).join(' ')
    return [dialogue(start, end, text)]
  })
}

export function buildAssSubtitles(input: {
  cues: CaptionCue[]
  words: TranscriptWord[]
  settings: CaptionSettings
  highlightColor: string
  width: number
  height: number
  overlays?: TextOverlay[]
}): string {
  const { cues, words, settings, width, height } = input
  const highlight = hexToAssOverrideColor(input.highlightColor)
  const captionEvents =
    settings.style === 'none'
      ? []
      : settings.wordHighlight
        ? cues.flatMap((cue) => highlightEvents(cue, words, highlight, settings))
        : cues.map((cue) => dialogue(cue.s, cue.e, caseText(cue.text, settings)))
  const events = [...captionEvents, ...overlayEvents({ overlays: input.overlays ?? [], width, height, assTime })]

  return [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    styleLine(settings, width, height),
    ...overlayStyleLines(),
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ...events,
    '',
  ].join('\n')
}
