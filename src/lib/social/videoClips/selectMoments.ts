import type { Sentence } from './sentences'
import type { ClipMoment, TranscriptWord } from './types'

export type MomentBounds = { min: number; max: number }

/** A clip as a whole-sentence range (inclusive indices into the sentence list). */
export type SentencePick = { a: number; b: number; title: string; score: number }

/** Below this many words the transcript is too thin for the LLM to pick moments. */
export const MIN_TRANSCRIPT_WORDS = 25

export function buildMomentPrompt(input: {
  sentences: Sentence[]
  durationSeconds: number
  clipCount: number
  bounds: MomentBounds
  aboutText: string | null
}): string {
  const lines = input.sentences
    .map((s, i) => `#${i} [${s.s.toFixed(1)}-${s.e.toFixed(1)}] ${s.text}`)
    .join('\n')
  return [
    'You pick the best short social media clips from a video by a small Australian food or produce seller (farm stall, home baker, market stallholder or local producer).',
    'The transcript is split into numbered sentences. A clip is a run of whole sentences.',
    input.aboutText ? `The seller says this video is about: ${input.aboutText}` : '',
    `Video length: ${input.durationSeconds.toFixed(0)} seconds.`,
    `Return exactly ${input.clipCount} clips, each about ${input.bounds.min}-${input.bounds.max} seconds long`,
    '(use the timestamps), not overlapping. Only return fewer if the video is too short.',
    'Each clip must:',
    '- open with a hook: a strong first line, question, bold claim or striking result — not filler like "so yeah" or "um";',
    '- end on a complete thought: the payoff, result, tip or punchline — never mid-explanation or on "and then…";',
    '- make sense to someone who has not seen the rest of the video.',
    'Prefer quotable lines, clear tips, product reveals, how it is grown or made, what is fresh or in season, offers and collection details, happy customers and strong opinions.',
    'Respond with JSON only: {"clips":[{"startSentence":number,"endSentence":number,"title":string,"score":number}]}',
    'startSentence/endSentence: inclusive sentence numbers. title: max 60 characters, plain words.',
    'score: 0-100 for how engaging the clip is.',
    '',
    'Sentences (#number [start-end seconds] text):',
    lines,
  ]
    .filter(Boolean)
    .join('\n')
}

export function parseMomentResponse(raw: string, sentenceCount: number): SentencePick[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  const clips = (parsed as { clips?: unknown })?.clips
  if (!Array.isArray(clips)) return []
  const out: SentencePick[] = []
  for (const c of clips) {
    const item = c && typeof c === 'object' ? (c as Record<string, unknown>) : {}
    const a = Number(item.startSentence)
    const b = Number(item.endSentence)
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < a || b >= sentenceCount) continue
    const title = typeof item.title === 'string' ? item.title.trim().slice(0, 80) : ''
    const score = Number(item.score)
    out.push({ a, b, title, score: Number.isFinite(score) ? Math.round(score) : 50 })
  }
  return out
}

/** Evenly spaced windows for footage with little or no speech. */
export function fallbackMoments(
  durationSeconds: number,
  bounds: MomentBounds,
  limit: number,
): ClipMoment[] {
  const length = Math.min(bounds.max, Math.max(bounds.min, durationSeconds / (limit + 1)))
  if (durationSeconds <= length) {
    return [{ start: 0, end: durationSeconds, title: 'Clip 1', score: 50 }]
  }
  const count = Math.max(1, Math.min(limit, Math.floor(durationSeconds / length)))
  const gap = (durationSeconds - count * length) / (count + 1)
  return Array.from({ length: count }, (_, i) => {
    const start = gap + i * (length + gap)
    return { start, end: start + length, title: `Clip ${i + 1}`, score: 50 }
  })
}

export function wordsForClip(words: TranscriptWord[], start: number, end: number): TranscriptWord[] {
  return words
    .filter((w) => w.s >= start && w.e <= end)
    .map((w) => ({ w: w.w, s: round2(w.s - start), e: round2(w.e - start) }))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
