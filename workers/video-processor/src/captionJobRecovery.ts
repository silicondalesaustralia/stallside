import type { SupabaseClient } from '@supabase/supabase-js'

const TABLE = 'social_video_caption_jobs'
/** Editor renders are one clip (up to a 5-minute whole video) — this long without finishing means the worker died. */
const STALE_MINUTES = 20
const REQUEUED_MARKER = 'requeued_after_stall'

function logError(label: string, message: string) {
  if (!/does not exist|schema cache/i.test(message)) console.error(`[VideoCaptions] ${label}`, message)
}

async function requeue(db: SupabaseClient, filter: { workerId?: string; claimedBefore?: string }): Promise<number> {
  let query = db
    .from(TABLE)
    .update({ status: 'pending', claimed_at: null, worker_id: null, error_message: REQUEUED_MARKER, updated_at: new Date().toISOString() })
    .eq('status', 'processing')
  if (filter.workerId) query = query.eq('worker_id', filter.workerId)
  if (filter.claimedBefore) query = query.lt('claimed_at', filter.claimedBefore).is('error_message', null)
  const { data, error } = await query.select('id')
  if (error) {
    logError('requeue failed', error.message)
    return 0
  }
  for (const row of data ?? []) console.warn('[VideoCaptions] requeued caption job', row.id)
  return data?.length ?? 0
}

/** On startup: caption jobs this worker id still holds were cut off by a restart/deploy. */
export function requeueInterruptedCaptionJobs(db: SupabaseClient, workerId: string): Promise<number> {
  return requeue(db, { workerId })
}

/** Stalled jobs get one retry (any worker may have died holding them); a second stall fails. */
export async function recoverStaleCaptionJobs(db: SupabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString()
  const { data, error } = await db
    .from(TABLE)
    .update({ status: 'failed', error_message: 'Caption render timed out', completed_at: new Date().toISOString() })
    .eq('status', 'processing')
    .lt('claimed_at', cutoff)
    .eq('error_message', REQUEUED_MARKER)
    .select('id')
  if (error) logError('stale recovery failed', error.message)
  return (data?.length ?? 0) + (await requeue(db, { claimedBefore: cutoff }))
}
