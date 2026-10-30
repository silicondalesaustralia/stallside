/**
 * Estimated provider cost instrumentation for AI video clip jobs.
 * Writes to existing ai_usage_events — not a second billing ledger.
 * cost_quality is always "estimated" unless a verified invoice amount is supplied.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  calculateSummarizationCostUsd,
  roundUsd,
  TRANSCRIPTION_USD_PER_MINUTE,
} from '@/lib/billing/recordingCost'
import { recordAiUsageEvent } from '@/lib/aiUsage/recordAiUsageEvent'

export const VIDEO_CLIP_USAGE_FEATURE = 'social_video_clip' as const

export type VideoClipUsageEstimateInput = {
  businessId: string
  jobId: string
  sourceId?: string | null
  /** Source video duration (seconds). */
  sourceDurationSeconds: number
  /** Whisper / transcription audio duration when known (defaults to source). */
  transcriptionDurationSeconds?: number
  transcriptionModel?: string
  momentSelection?: {
    model?: string
    promptTokens?: number
    completionTokens?: number
    source: 'llm' | 'fallback' | 'full'
  } | null
  clipCountRequested: number
  clipsCreated: number
  /** Sum of rendered clip durations (seconds). */
  renderedDurationSeconds: number
  /** Worker wall-clock processing time (ms). */
  workerDurationMs: number
  status: 'success' | 'failed' | 'partial'
  errorCode?: string | null
}

export function estimateVideoClipTranscriptionUsd(durationSeconds: number): number {
  return roundUsd((Math.max(0, durationSeconds) / 60) * TRANSCRIPTION_USD_PER_MINUTE)
}

export function estimateVideoClipMomentLlmUsd(input: {
  promptTokens?: number
  completionTokens?: number
}): number {
  return roundUsd(
    calculateSummarizationCostUsd({
      promptTokens: input.promptTokens ?? 0,
      completionTokens: input.completionTokens ?? 0,
    }),
  )
}

/** Build estimate totals without writing — useful for tests. */
export function estimateVideoClipJobCostUsd(input: VideoClipUsageEstimateInput): {
  transcriptionUsd: number
  momentLlmUsd: number
  estimatedUsd: number
} {
  const transcriptionSeconds =
    input.transcriptionDurationSeconds ?? input.sourceDurationSeconds
  const transcriptionUsd = estimateVideoClipTranscriptionUsd(transcriptionSeconds)
  const momentLlmUsd =
    input.momentSelection?.source === 'llm'
      ? estimateVideoClipMomentLlmUsd({
          promptTokens: input.momentSelection.promptTokens,
          completionTokens: input.momentSelection.completionTokens,
        })
      : 0
  return {
    transcriptionUsd,
    momentLlmUsd,
    estimatedUsd: roundUsd(transcriptionUsd + momentLlmUsd),
  }
}

/**
 * Record estimated Whisper + moment-LLM + processing metadata for a clip job.
 * Never treats estimates as verified provider charges.
 */
export async function recordVideoClipJobUsageEstimate(
  db: SupabaseClient,
  input: VideoClipUsageEstimateInput,
): Promise<void> {
  const estimate = estimateVideoClipJobCostUsd(input)
  const requestId = `video_clip_job:${input.jobId}`
  await recordAiUsageEvent(
    {
      businessId: input.businessId,
      feature: VIDEO_CLIP_USAGE_FEATURE,
      provider: 'openai',
      model:
        input.momentSelection?.model ||
        input.transcriptionModel ||
        'whisper-1+gpt-4o-mini',
      usageType: 'provider_cost',
      units: input.clipsCreated,
      unitName: 'clips',
      requestId,
      relatedEntityType: 'social_video_clip_job',
      relatedEntityId: input.jobId,
      providerCostUsd: estimate.estimatedUsd,
      costQuality: 'estimated',
      status: input.status,
      errorCode: input.errorCode ?? null,
      inputTokens: input.momentSelection?.promptTokens ?? null,
      outputTokens: input.momentSelection?.completionTokens ?? null,
      metadata: {
        estimate_only: true,
        verified_provider_charge: false,
        source_id: input.sourceId ?? null,
        source_duration_seconds: input.sourceDurationSeconds,
        transcription_duration_seconds:
          input.transcriptionDurationSeconds ?? input.sourceDurationSeconds,
        transcription_cost_usd_estimated: estimate.transcriptionUsd,
        moment_llm_cost_usd_estimated: estimate.momentLlmUsd,
        moment_source: input.momentSelection?.source ?? null,
        clip_count_requested: input.clipCountRequested,
        clips_created: input.clipsCreated,
        rendered_duration_seconds: input.renderedDurationSeconds,
        worker_duration_ms: input.workerDurationMs,
        // Processing infra cost unknown without a known Railway/CPU rate — duration only.
        worker_processing_cost_usd_estimated: null,
      },
    },
    db,
  )
}
