import type { SupabaseClient } from '@supabase/supabase-js'
import { refundSocialCredits } from './ledger'

/** Clip jobs are charged up front for every requested clip. */
export function clipJobCreditActionId(jobId: string): string {
  return `clip-job:${jobId}`
}

export type ClipJobCreditRow = { id: string; clip_count: number | null; clips_created: number | null }

/** Give back credits for clips the job didn't produce. Never throws - a refund must not fail the job. */
export async function refundUnmadeClips(db: SupabaseClient, job: ClipJobCreditRow): Promise<void> {
  const unmade = (job.clip_count ?? 0) - (job.clips_created ?? 0)
  if (unmade <= 0) return
  try {
    const refunded = await refundSocialCredits(db, 'clip', clipJobCreditActionId(job.id), unmade)
    if (refunded > 0) console.log(`[socialCredits] refunded ${refunded} clip credit(s) for job ${job.id}`)
  } catch (err) {
    console.error('[socialCredits] clip refund failed', job.id, err)
  }
}
