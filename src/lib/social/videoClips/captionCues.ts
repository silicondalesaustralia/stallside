import { sanitizeAudioMutes } from './audioEdits'
import { DEFAULT_CAPTION_SETTINGS, parseCaptionSettings, type CaptionSettings } from './captionStyles'
import { sanitizeOverlays, type TextOverlay } from './textOverlays'
import { normalizeSegments, type ClipSegment } from './timeline'
import { parseClipSpeed } from './playbackSpeed'
import type { TranscriptWord } from './types'

/** One on-screen caption line. Times are seconds of the caption-free clip. */
export type CaptionCue = { s: number; e: number; text: string }

/** Shape stored in social_media_assets.captions. */
export type CaptionsDoc = {
  words: TranscriptWord[]
  cues: CaptionCue[]
  settings: CaptionSettings
  /** social-posts path of the caption-free clip used for re-renders. */
  cleanPath: string | null
  /** Length of the caption-free clip (edits never extend past it). */
  cleanDuration: number | null
  /** Kept ranges of the caption-free clip; null = whole clip. */
  segments: ClipSegment[] | null
  overlays: TextOverlay[]
  /** Final playback speed (1 = normal); cues/segments stay in caption-free clip time. */
  speed?: number
  /** Voice ranges (clip time) played silent in the final render. */
  audioMutes?: ClipSegment[]
}

const MAX_WORDS_PER_CUE = 4
const MAX_CHARS_PER_CUE = 26
const MAX_GAP_SECONDS = 0.7
export const MAX_CUES = 300
export const MAX_CUE_CHARS = 120

const round = (n: number) => Math.round(n * 100) / 100

export function groupWordsIntoCues(words: TranscriptWord[]): CaptionCue[] {
  const cues: CaptionCue[] = []
  let current: TranscriptWord[] = []
  const flush = () => {
    if (!current.length) return
    cues.push({
      s: current[0].s,
      e: current[current.length - 1].e,
      text: current.map((w) => w.w.trim()).join(' '),
    })
    current = []
  }
  for (const word of words) {
    const last = current[current.length - 1]
    const nextChars = current.map((w) => w.w).join(' ').length + word.w.length + 1
    if (
      last &&
      (current.length >= MAX_WORDS_PER_CUE ||
        nextChars > MAX_CHARS_PER_CUE ||
        word.s - last.e > MAX_GAP_SECONDS ||
        /[.!?]$/.test(last.w.trim()))
    ) {
      flush()
    }
    current.push(word)
  }
  flush()
  return cues
}

/** Word timings for a cue: real timings when the text is unedited, else evenly spread. */
export function wordsForCue(cue: CaptionCue, words: TranscriptWord[]): TranscriptWord[] {
  const inside = words.filter((w) => w.s >= cue.s - 0.01 && w.e <= cue.e + 0.01)
  const tokens = cue.text.split(/\s+/).filter(Boolean)
  if (inside.length === tokens.length && inside.every((w, i) => w.w.trim() === tokens[i])) {
    return inside
  }
  const step = (cue.e - cue.s) / Math.max(1, tokens.length)
  return tokens.map((w, i) => ({ w, s: round(cue.s + i * step), e: round(cue.s + (i + 1) * step) }))
}

function asWords(value: unknown): TranscriptWord[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (w): w is TranscriptWord =>
      !!w && typeof w.w === 'string' && typeof w.s === 'number' && typeof w.e === 'number',
  )
}

export function sanitizeCues(value: unknown, maxSeconds: number): CaptionCue[] {
  if (!Array.isArray(value)) return []
  const cues: CaptionCue[] = []
  for (const raw of value.slice(0, MAX_CUES)) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const text = typeof r.text === 'string' ? r.text.replace(/[{}\\]/g, '').trim().slice(0, MAX_CUE_CHARS) : ''
    const s = Number(r.s)
    const e = Number(r.e)
    if (!text || !Number.isFinite(s) || !Number.isFinite(e)) continue
    const start = Math.max(0, Math.min(s, maxSeconds))
    const end = Math.max(start + 0.1, Math.min(e, maxSeconds))
    cues.push({ s: round(start), e: round(end), text })
  }
  return cues.sort((a, b) => a.s - b.s)
}

export function parseCaptionsDoc(value: unknown): CaptionsDoc {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const words = asWords(raw.words)
  const cues = Array.isArray(raw.cues) ? sanitizeCues(raw.cues, Number.MAX_SAFE_INTEGER) : groupWordsIntoCues(words)
  const cleanDuration = Number(raw.cleanDuration)
  const hasDuration = Number.isFinite(cleanDuration) && cleanDuration > 0
  return {
    words,
    cues,
    settings: raw.settings ? parseCaptionSettings(raw.settings) : DEFAULT_CAPTION_SETTINGS,
    cleanPath: typeof raw.cleanPath === 'string' && raw.cleanPath ? raw.cleanPath : null,
    cleanDuration: hasDuration ? cleanDuration : null,
    segments:
      hasDuration && Array.isArray(raw.segments) ? normalizeSegments(raw.segments, cleanDuration) : null,
    overlays: sanitizeOverlays(raw.overlays, hasDuration ? cleanDuration : Number.MAX_SAFE_INTEGER),
    speed: parseClipSpeed(raw.speed),
    audioMutes: sanitizeAudioMutes(raw.audioMutes, hasDuration ? cleanDuration : Number.MAX_SAFE_INTEGER),
  }
}
