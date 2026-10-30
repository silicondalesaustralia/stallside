import type { MomentBounds } from './selectMoments'
import type { TranscriptWord } from './types'

/** A spoken sentence (or pause-delimited phrase) in source-video seconds. */
export type Sentence = { s: number; e: number; text: string; words: number }

const SENTENCE_GAP_SECONDS = 0.7
/** Unpunctuated run-ons are split at the next small pause after this long. */
const LONG_SENTENCE_SECONDS = 15
const LONG_SENTENCE_GAP_SECONDS = 0.25
/** Breathing room kept before the first and after the last word of a clip. */
const LEAD_IN_SECONDS = 0.15
const TAIL_SECONDS = 0.35
/** Whole sentences rarely hit the length range exactly; this much over/under is allowed. */
const LENGTH_SLACK = 0.15

export function buildSentences(words: TranscriptWord[]): Sentence[] {
  const sentences: Sentence[] = []
  let current: TranscriptWord[] = []
  const flush = () => {
    if (!current.length) return
    sentences.push({
      s: current[0].s,
      e: current[current.length - 1].e,
      text: current.map((w) => w.w.trim()).join(' '),
      words: current.length,
    })
    current = []
  }
  for (const word of words) {
    const last = current[current.length - 1]
    if (last) {
      const gap = word.s - last.e
      const ended = /[.!?]["')\]]*$/.test(last.w.trim())
      const tooLong = word.s - current[0].s >= LONG_SENTENCE_SECONDS && gap >= LONG_SENTENCE_GAP_SECONDS
      if (ended || gap >= SENTENCE_GAP_SECONDS || tooLong) flush()
    }
    current.push(word)
  }
  flush()
  return sentences
}

/** Clip times for sentences a..b, padded into the surrounding silence without touching neighbouring words. */
export function rangeTimes(
  sentences: Sentence[],
  a: number,
  b: number,
  duration: number,
): { start: number; end: number } {
  const first = sentences[a]
  const last = sentences[b]
  const prevEnd = a > 0 ? sentences[a - 1].e : 0
  const nextStart = b < sentences.length - 1 ? sentences[b + 1].s : duration
  const start = Math.max(0, first.s - LEAD_IN_SECONDS, a > 0 ? (prevEnd + first.s) / 2 : 0)
  const end = Math.min(duration, last.e + TAIL_SECONDS, b < sentences.length - 1 ? (last.e + nextStart) / 2 : duration)
  return { start: Math.round(start * 100) / 100, end: Math.round(end * 100) / 100 }
}

function rangeLength(sentences: Sentence[], a: number, b: number, duration: number): number {
  const t = rangeTimes(sentences, a, b, duration)
  return t.end - t.start
}

/**
 * Grows or shrinks a sentence range by whole sentences until it fits the length range.
 * Shrinks from the end (the opening line is the hook); grows forward first. Null when impossible.
 */
export function fitRange(
  sentences: Sentence[],
  a: number,
  b: number,
  duration: number,
  bounds: MomentBounds,
): [number, number] | null {
  if (a < 0 || b >= sentences.length || a > b) return null
  const min = Math.min(bounds.min, duration) * (1 - LENGTH_SLACK)
  const max = bounds.max * (1 + LENGTH_SLACK)
  let lo = a
  let hi = b
  while (hi > lo && rangeLength(sentences, lo, hi, duration) > max) hi--
  while (rangeLength(sentences, lo, hi, duration) < min) {
    if (hi < sentences.length - 1 && rangeLength(sentences, lo, hi + 1, duration) <= max) hi++
    else if (lo > 0 && rangeLength(sentences, lo - 1, hi, duration) <= max) lo--
    else break
  }
  const length = rangeLength(sentences, lo, hi, duration)
  return length >= min && length <= max ? [lo, hi] : null
}

export function titleFromSentence(text: string): string {
  const words = text.replace(/[.!?,]+$/, '').split(/\s+/).slice(0, 8).join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
