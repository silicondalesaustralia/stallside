import type { SupabaseClient } from '@supabase/supabase-js'

/** Jobs claimed longer than this are treated as stale (worker crash / hang). */
export const STALE_PROCESSING_MINUTES = 10

export const STALE_PROCESSING_ERROR_CODE = 'stale_processing_job'

export function staleProcessingCutoffIso(now = Date.now()): string {
  return new Date(now - STALE_PROCESSING_MINUTES * 60 * 1000).toISOString()
}

/**
 * Fail jobs stuck in `processing` after worker crash or FFmpeg hang.
 * Safe with multiple worker replicas - idempotent conditional updates.
 */
export async function recoverStaleProcessingJobs(
  db: SupabaseClient,
  now = Date.now(),
): Promise<number> {
  const cutoff = staleProcessingCutoffIso(now)

  const { data: staleJobs, error: listErr } = await db
    .from('social_video_processing_jobs')
    .select('id, asset_id')
    .eq('status', 'processing')
    .lt('claimed_at', cutoff)

  if (listErr || !staleJobs?.length) {
    return 0
  }

  let recovered = 0
  const nowIso = new Date(now).toISOString()

  for (const job of staleJobs) {
    const { data: updatedJob } = await db
      .from('social_video_processing_jobs')
      .update({
        status: 'failed',
        error_code: STALE_PROCESSING_ERROR_CODE,
        error_message: `Processing exceeded ${STALE_PROCESSING_MINUTES} minutes without completion`,
        completed_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', job.id)
      .eq('status', 'processing')
      .select('id')
      .maybeSingle()

    if (!updatedJob) continue

    await db
      .from('social_media_assets')
      .update({
        processing_status: 'processing_failed',
        updated_at: nowIso,
      })
      .eq('id', job.asset_id)
      .eq('processing_status', 'processing')

    recovered += 1
    console.warn('[VideoBranding] recovered stale job', job.id, job.asset_id)
  }

  return recovered
}
