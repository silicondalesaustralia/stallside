import { fitPicks, picksToMoments, topUpPicks } from './momentRanges'
import {
  MIN_TRANSCRIPT_WORDS,
  buildMomentPrompt,
  fallbackMoments,
  parseMomentResponse,
  type MomentBounds,
} from './selectMoments'
import { buildSentences } from './sentences'
import type { ClipMoment, Transcript } from './types'

export const DEFAULT_CLIP_LLM_MODEL = 'gpt-4o-mini'

export type MomentLlmUsage = { model: string; promptTokens: number; completionTokens: number }

export type PickMomentsResult = {
  moments: ClipMoment[]
  source: 'llm' | 'fallback'
  llmUsage?: MomentLlmUsage
}

export async function pickMoments(input: {
  transcript: Transcript
  durationSeconds: number
  clipCount: number
  bounds: MomentBounds
  aboutText: string | null
}): Promise<PickMomentsResult> {
  const { transcript, durationSeconds, clipCount, bounds } = input
  const timedFallback = (): PickMomentsResult => ({
    moments: fallbackMoments(durationSeconds, bounds, clipCount),
    source: 'fallback',
  })

  if (transcript.words.length < MIN_TRANSCRIPT_WORDS) return timedFallback()
  const sentences = buildSentences(transcript.words)
  const sentenceFallback = (): PickMomentsResult => {
    const picks = topUpPicks([], sentences, durationSeconds, bounds, clipCount)
    return picks.length
      ? { moments: picksToMoments(picks, sentences, durationSeconds), source: 'fallback' }
      : timedFallback()
  }

  try {
    const { content: raw, usage: llmUsage } = await callMomentLlm(
      buildMomentPrompt({ sentences, durationSeconds, clipCount, bounds, aboutText: input.aboutText }),
    )
    const picks = fitPicks(parseMomentResponse(raw, sentences.length), sentences, durationSeconds, bounds, clipCount)
    if (!picks.length) return sentenceFallback()
    if (picks.length < clipCount) {
      console.warn('[VideoClips] LLM returned fewer usable moments than asked, topping up', {
        asked: clipCount,
        got: picks.length,
      })
    }
    const all = topUpPicks(picks, sentences, durationSeconds, bounds, clipCount)
    return { moments: picksToMoments(all, sentences, durationSeconds), source: 'llm', llmUsage }
  } catch (err) {
    console.error('[VideoClips] moment LLM failed, using sentence fallback', {
      error: err instanceof Error ? err.message : String(err),
    })
    return sentenceFallback()
  }
}

async function callMomentLlm(prompt: string): Promise<{ content: string; usage: MomentLlmUsage }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('openai_key_missing')
  const model = process.env.VIDEO_CLIP_LLM_MODEL?.trim() || DEFAULT_CLIP_LLM_MODEL

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`moment_llm_failed ${res.status}: ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }
  return {
    content: json.choices?.[0]?.message?.content ?? '',
    usage: {
      model,
      promptTokens: json.usage?.prompt_tokens ?? 0,
      completionTokens: json.usage?.completion_tokens ?? 0,
    },
  }
}
