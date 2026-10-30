import type { SupabaseClient } from '@supabase/supabase-js'
import { CLIP_LENGTH_RANGES, FULL_VIDEO_MAX_DURATION_SECONDS } from '../../../src/lib/social/videoClips/limits'
import type { ClipJobRow, ClipMoment, Transcript } from '../../../src/lib/social/videoClips/types'
import { pickMoments } from '../../../src/lib/social/videoClips/pickMoments'
import { updateClipJob } from './clipJobQueue'

export type MomentSelection = {
  model?: string
  promptTokens?: number
  completionTokens?: number
  source: 'llm' | 'fallback' | 'full'
}

type Input = {
  db: SupabaseClient
  job: ClipJobRow
  transcript: Transcript
  duration: number
  title: string | null
  aboutText: string | null
}

/** Whole-video jobs become one moment; otherwise the LLM (or fallback) picks moments. */
export async function selectClipJobMoments(
  input: Input,
): Promise<{ moments: ClipMoment[]; selection: MomentSelection }> {
  const { db, job, transcript, duration, title, aboutText } = input
  if (job.clip_length === 'full') {
    if (duration > FULL_VIDEO_MAX_DURATION_SECONDS + 1) throw new Error('video_too_long_for_whole_video')
    return {
      moments: [{ start: 0, end: duration, title: title?.trim() || 'Full video', score: null }],
      selection: { source: 'full' },
    }
  }
  await updateClipJob(db, job.id, { progress_stage: 'selecting' })
  const picked = await pickMoments({
    transcript,
    durationSeconds: duration,
    clipCount: job.clip_count,
    bounds: CLIP_LENGTH_RANGES[job.clip_length],
    aboutText,
  })
  return {
    moments: picked.moments,
    selection: {
      source: picked.source,
      model: picked.llmUsage?.model,
      promptTokens: picked.llmUsage?.promptTokens,
      completionTokens: picked.llmUsage?.completionTokens,
    },
  }
}
