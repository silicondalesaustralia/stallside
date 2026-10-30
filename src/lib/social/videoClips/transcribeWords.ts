import { readFile } from 'node:fs/promises'
import type { Transcript } from './types'

/** Must support verbose_json + word timestamps (gpt-4o-transcribe does not). */
export const DEFAULT_CLIP_TRANSCRIBE_MODEL = 'whisper-1'

const TRANSCRIBE_PROMPT =
  'Australian English. A tradie filming a job: trade terms, materials, suburbs and measurements.'

type WhisperVerbose = {
  text?: string
  segments?: Array<{ start?: number; end?: number; text?: string }>
  words?: Array<{ word?: string; start?: number; end?: number }>
}

/** Transcribe an MP3 (<25 MB) with word + segment timestamps via OpenAI. */
export async function transcribeWords(audioPath: string): Promise<Transcript> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('openai_key_missing')

  const model = process.env.VIDEO_CLIP_TRANSCRIBE_MODEL?.trim() || DEFAULT_CLIP_TRANSCRIBE_MODEL
  const audio = await readFile(audioPath)
  const form = new FormData()
  form.append('file', new Blob([audio], { type: 'audio/mpeg' }), 'audio.mp3')
  form.append('model', model)
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')
  form.append('timestamp_granularities[]', 'segment')
  form.append('language', 'en')
  form.append('prompt', TRANSCRIBE_PROMPT)

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`transcribe_failed ${res.status}: ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as WhisperVerbose

  return {
    text: json.text?.trim() ?? '',
    segments: (json.segments ?? [])
      .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end))
      .map((s) => ({ start: Number(s.start), end: Number(s.end), text: s.text?.trim() ?? '' })),
    words: (json.words ?? [])
      .filter((w) => w.word && Number.isFinite(w.start) && Number.isFinite(w.end))
      .map((w) => ({ w: String(w.word).trim(), s: Number(w.start), e: Number(w.end) })),
  }
}
