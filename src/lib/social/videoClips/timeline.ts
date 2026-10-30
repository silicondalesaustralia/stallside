import type { CaptionCue } from './captionCues'
import type { TranscriptWord } from './types'

/** A kept range of the caption-free clip, in seconds of that clip. */
export type ClipSegment = { s: number; e: number }

export const MIN_SEGMENT_SECONDS = 0.3
export const MAX_SEGMENTS = 40

const round = (n: number) => Math.round(n * 100) / 100

export function fullSegments(duration: number): ClipSegment[] {
  return [{ s: 0, e: round(duration) }]
}

/** Clamp, sort and drop tiny/overlapping ranges. */
export function normalizeSegments(value: unknown, duration: number): ClipSegment[] {
  if (!Array.isArray(value)) return fullSegments(duration)
  const parsed = value
    .slice(0, MAX_SEGMENTS)
    .map((raw) => {
      const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
      return { s: Number(r.s), e: Number(r.e) }
    })
    .filter((seg) => Number.isFinite(seg.s) && Number.isFinite(seg.e))
    .map((seg) => ({ s: round(Math.max(0, seg.s)), e: round(Math.min(duration, seg.e)) }))
    .filter((seg) => seg.e - seg.s >= MIN_SEGMENT_SECONDS)
    .sort((a, b) => a.s - b.s)

  const merged: ClipSegment[] = []
  for (const seg of parsed) {
    const last = merged[merged.length - 1]
    if (last && seg.s < last.e) last.e = Math.max(last.e, seg.e)
    else merged.push({ ...seg })
  }
  return merged.length ? merged : fullSegments(duration)
}

export function isFullClip(segments: ClipSegment[], duration: number): boolean {
  return segments.length === 1 && segments[0].s <= 0.05 && segments[0].e >= duration - 0.05
}

export function outputDuration(segments: ClipSegment[]): number {
  return round(segments.reduce((sum, seg) => sum + (seg.e - seg.s), 0))
}

/** Clip time → output time, or null when the moment was cut out. */
export function toOutputTime(t: number, segments: ClipSegment[]): number | null {
  let offset = 0
  for (const seg of segments) {
    if (t >= seg.s && t <= seg.e) return round(offset + (t - seg.s))
    offset += seg.e - seg.s
  }
  return null
}

/** Re-time ranged items onto the edited output; an item spanning a cut is split, parts inside cuts dropped. */
export function mapTimedToOutput<T extends { s: number; e: number }>(items: T[], segments: ClipSegment[]): T[] {
  const out: T[] = []
  for (const item of items) {
    for (const seg of segments) {
      const s = Math.max(item.s, seg.s)
      const e = Math.min(item.e, seg.e)
      if (e - s < 0.15) continue
      const os = toOutputTime(s, segments)
      const oe = toOutputTime(e, segments)
      if (os != null && oe != null) out.push({ ...item, s: os, e: oe })
    }
  }
  return out
}

/** Re-time captions onto the edited output; parts inside cut sections are dropped. */
export function mapCaptionsToOutput(
  cues: CaptionCue[],
  words: TranscriptWord[],
  segments: ClipSegment[],
): { cues: CaptionCue[]; words: TranscriptWord[] } {
  const outCues = mapTimedToOutput(cues, segments)
  const outWords: TranscriptWord[] = []
  for (const w of words) {
    const s = toOutputTime(w.s, segments)
    const e = toOutputTime(w.e, segments)
    if (s != null && e != null && e > s) outWords.push({ w: w.w, s, e })
  }
  return { cues: outCues, words: outWords }
}

/** Next playable time at or after t (skips cut sections), or null past the end. */
export function nextPlayableTime(t: number, segments: ClipSegment[]): number | null {
  for (const seg of segments) {
    if (t < seg.s) return seg.s
    if (t <= seg.e - 0.02) return t
  }
  return null
}
