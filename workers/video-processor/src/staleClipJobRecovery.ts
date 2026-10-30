import type { SupabaseClient } from '@supabase/supabase-js'

/** Long sources take a while: transcription + several encodes. */
export const STALE_CLIP_JOB_MINUTES = 45

/**
 * On startup, jobs this worker id still holds were cut off by a restart/deploy. Requeue
 * ones with no clips saved yet (safe to redo); fail the rest so clips aren't duplicated.
 */
export async function requeueInterruptedClipJobs(db: SupabaseClient, workerId: string): Promise<number> {
  const nowIso = new Date().toISOString()
  const { data: requeued, error } = await db
    .from('social_video_clip_jobs')
    .update({ status: 'pending', claimed_at: null, worker_id: null, progress_stage: null, updated_at: nowIso })
    .eq('status', 'processing')
    .eq('worker_id', workerId)
    .eq('clips_created', 0)
    .select('id')
  if (error) {
    console.error('[VideoClips] requeue interrupted failed', error.message)
    return 0
  }
  const { data: interrupted, error: failErr } = await db
    .from('social_video_clip_jobs')
    .update({
      status: 'failed',
      error_code: 'interrupted',
      error_message: 'Clipping was interrupted by a restart — make more clips to continue',
      completed_at: nowIso,
      updated_at: nowIso,
    })
    .eq('status', 'processing')
    .eq('worker_id', workerId)
    .select('id')
  if (failErr) console.error('[VideoClips] fail interrupted failed', failErr.message)
  for (const row of interrupted ?? []) console.warn('[VideoClips] failed interrupted clip job', row.id)
  for (const row of requeued ?? []) console.warn('[VideoClips] requeued interrupted clip job', row.id)
  return requeued?.length ?? 0
}

export async function recoverStaleClipJobs(db: SupabaseClient, now = Date.now()): Promise<number> {
  const cutoff = new Date(now - STALE_CLIP_JOB_MINUTES * 60 * 1000).toISOString()
  const nowIso = new Date(now).toISOString()

  const { data, error } = await db
    .from('social_video_clip_jobs')
    .update({
      status: 'failed',
      error_code: 'stale_clip_job',
      error_message: `Clipping exceeded ${STALE_CLIP_JOB_MINUTES} minutes without completion`,
      completed_at: nowIso,
      updated_at: nowIso,
    })
    .eq('status', 'processing')
    .lt('claimed_at', cutoff)
    .select('id, clips_created')

  if (error) {
    console.error('[VideoClips] stale recovery failed', error.message)
    return 0
  }
  for (const row of data ?? []) {
    console.warn('[VideoClips] recovered stale clip job', row.id, { delivered: row.clips_created })
  }
  return data?.length ?? 0
}
