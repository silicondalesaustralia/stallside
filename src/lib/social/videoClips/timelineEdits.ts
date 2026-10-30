import { MAX_CUE_CHARS, type CaptionCue } from './captionCues'
import { MIN_SEGMENT_SECONDS, type ClipSegment } from './timeline'

export const MIN_CUE_SECONDS = 0.2
const NEW_CUE_SECONDS = 1.5

export type CueDragMode = 'move' | 'start' | 'end'

const round = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)

export function segmentIndexAt(segments: ClipSegment[], t: number): number {
  return segments.findIndex((seg) => t >= seg.s && t < seg.e)
}

/** Splits the section under t in two; null when t is too close to an edge. */
export function splitSegmentsAt(segments: ClipSegment[], t: number): ClipSegment[] | null {
  const i = segmentIndexAt(segments, t)
  if (i < 0) return null
  const seg = segments[i]
  if (t - seg.s < MIN_SEGMENT_SECONDS || seg.e - t < MIN_SEGMENT_SECONDS) return null
  return [...segments.slice(0, i), { s: seg.s, e: round(t) }, { s: round(t), e: seg.e }, ...segments.slice(i + 1)]
}

/** Removes the section under t; null when it is the last one left. */
export function deleteSegmentAt(segments: ClipSegment[], t: number): ClipSegment[] | null {
  const i = segmentIndexAt(segments, t)
  if (i < 0 || segments.length <= 1) return null
  return segments.filter((_, j) => j !== i)
}

/** Cuts everything before (side 'start') or after (side 'end') t. */
export function trimSegmentsAt(segments: ClipSegment[], t: number, side: 'start' | 'end'): ClipSegment[] | null {
  const next = segments
    .map((seg) => (side === 'start' ? { s: Math.max(seg.s, round(t)), e: seg.e } : { s: seg.s, e: Math.min(seg.e, round(t)) }))
    .filter((seg) => seg.e - seg.s >= MIN_SEGMENT_SECONDS)
  return next.length ? next : null
}

export function cueIndexAt(cues: CaptionCue[], t: number): number {
  return cues.findIndex((c) => t >= c.s && t < c.e)
}

/** Splits caption i at t, dividing its words by time. */
export function splitCueAt(cues: CaptionCue[], i: number, t: number): CaptionCue[] | null {
  const cue = cues[i]
  if (!cue || t - cue.s < MIN_CUE_SECONDS || cue.e - t < MIN_CUE_SECONDS) return null
  const words = cue.text.split(/\s+/).filter(Boolean)
  if (words.length < 2) return null
  const n = clamp(Math.round((words.length * (t - cue.s)) / (cue.e - cue.s)), 1, words.length - 1)
  const first = { s: cue.s, e: round(t), text: words.slice(0, n).join(' ') }
  const second = { s: round(t), e: cue.e, text: words.slice(n).join(' ') }
  return [...cues.slice(0, i), first, second, ...cues.slice(i + 1)]
}

export function mergeCueWithNext(cues: CaptionCue[], i: number): CaptionCue[] | null {
  const a = cues[i]
  const b = cues[i + 1]
  if (!a || !b) return null
  const merged = { s: a.s, e: b.e, text: `${a.text} ${b.text}`.trim().slice(0, MAX_CUE_CHARS) }
  return [...cues.slice(0, i), merged, ...cues.slice(i + 2)]
}

/** Adds a caption at t in the gap before the next one; null when there is no room. */
export function addCueAt(cues: CaptionCue[], t: number, duration: number): CaptionCue[] | null {
  if (cueIndexAt(cues, t) >= 0) return null
  const nextStart = cues.find((c) => c.s > t)?.s ?? duration
  const e = Math.min(t + NEW_CUE_SECONDS, nextStart, duration)
  if (e - t < MIN_CUE_SECONDS) return null
  return [...cues, { s: round(t), e: round(e), text: 'New caption' }].sort((a, b) => a.s - b.s)
}

/** Moves or resizes caption i by delta seconds without overlapping its neighbours. */
export function dragCue(
  cues: CaptionCue[],
  i: number,
  mode: CueDragMode,
  delta: number,
  duration: number,
): CaptionCue[] {
  const cue = cues[i]
  if (!cue) return cues
  const minS = i > 0 ? cues[i - 1].e : 0
  const maxE = i < cues.length - 1 ? cues[i + 1].s : duration
  let { s, e } = cue
  if (mode === 'move') {
    const len = e - s
    s = clamp(s + delta, minS, Math.max(minS, maxE - len))
    e = s + len
  } else if (mode === 'start') {
    s = clamp(s + delta, minS, e - MIN_CUE_SECONDS)
  } else {
    e = clamp(e + delta, s + MIN_CUE_SECONDS, maxE)
  }
  return cues.map((c, j) => (j === i ? { ...c, s: round(s), e: round(e) } : c))
}
