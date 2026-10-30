import type { MomentBounds, SentencePick } from './selectMoments'
import { fitRange, rangeTimes, titleFromSentence, type Sentence } from './sentences'
import type { ClipMoment } from './types'

const overlaps = (x: SentencePick, y: SentencePick) => x.a <= y.b && y.a <= x.b

/** Fits each pick to the length range by whole sentences, then keeps the best non-overlapping `limit`. */
export function fitPicks(
  picks: SentencePick[],
  sentences: Sentence[],
  duration: number,
  bounds: MomentBounds,
  limit: number,
): SentencePick[] {
  const kept: SentencePick[] = []
  for (const pick of [...picks].sort((x, y) => y.score - x.score)) {
    if (kept.length >= limit) break
    const range = fitRange(sentences, pick.a, pick.b, duration, bounds)
    if (!range) continue
    const fitted = { ...pick, a: range[0], b: range[1] }
    if (kept.some((k) => overlaps(k, fitted))) continue
    kept.push(fitted)
  }
  return kept
}

/**
 * Adds whole-sentence clips from unused parts of the video until there are `limit`.
 * Prefers ranges that start after a clear pause (a natural new thought) and carry the most speech.
 */
export function topUpPicks(
  kept: SentencePick[],
  sentences: Sentence[],
  duration: number,
  bounds: MomentBounds,
  limit: number,
): SentencePick[] {
  const out = [...kept]
  if (out.length >= limit) return out
  const candidates: Array<SentencePick & { rank: number }> = []
  sentences.forEach((sentence, i) => {
    const range = fitRange(sentences, i, i, duration, bounds)
    if (!range) return
    const pause = i > 0 ? sentence.s - sentences[i - 1].e : 2
    let words = 0
    for (let j = range[0]; j <= range[1]; j++) words += sentences[j].words
    candidates.push({
      a: range[0],
      b: range[1],
      title: titleFromSentence(sentences[range[0]].text),
      score: 40,
      rank: Math.min(pause, 2) * 10 + words / 10,
    })
  })
  candidates.sort((x, y) => y.rank - x.rank)
  for (const c of candidates) {
    if (out.length >= limit) break
    if (out.some((k) => overlaps(k, c))) continue
    out.push({ a: c.a, b: c.b, title: c.title, score: c.score })
  }
  return out
}

export function picksToMoments(picks: SentencePick[], sentences: Sentence[], duration: number): ClipMoment[] {
  return picks
    .map((p) => {
      const { start, end } = rangeTimes(sentences, p.a, p.b, duration)
      return { start, end, title: p.title || titleFromSentence(sentences[p.a].text), score: p.score }
    })
    .sort((x, y) => x.start - y.start)
}
