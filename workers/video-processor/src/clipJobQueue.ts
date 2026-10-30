import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClipJobRow } from '../../../src/lib/social/videoClips/types'

export async function claimNextClipJob(
  db: SupabaseClient,
  workerId: string,
): Promise<ClipJobRow | null> {
  const { data: pending, error } = await db
    .from('social_video_clip_jobs')
    .select('id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) {
      console.error('[VideoClips] claim lookup failed', error.message)
    }
    return null
  }
  if (!pending) return null

  const now = new Date().toISOString()
  const { data: claimed, error: claimErr } = await db
    .from('social_video_clip_jobs')
    .update({
      status: 'processing',
      claimed_at: now,
      worker_id: workerId,
      progress_stage: 'downloading',
      updated_at: now,
    })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle()

  if (claimErr || !claimed) return null
  return claimed as ClipJobRow
}

export async function updateClipJob(
  db: SupabaseClient,
  jobId: string,
  patch: Record<string, string | number | null>,
): Promise<void> {
  const { error } = await db
    .from('social_video_clip_jobs')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', jobId)
  if (error) {
    console.error('[VideoClips] job update failed', { jobId, error: error.message })
  }
}
