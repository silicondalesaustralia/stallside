import type { SupabaseClient } from '@supabase/supabase-js'
import { SOCIAL_LOOKBACK_DAYS } from '@/lib/agent/types'
import type { WeekPlanRecentJob } from '@/lib/social/weekPlan/types'

const COMPLETED_STAGES = ['job_done', 'invoice_sent', 'paid'] as const
const SOCIAL_POST_STATUSES = ['draft', 'scheduled', 'posted'] as const

type JobRow = {
  id: string
  title: string | null
  stage: string
  site_suburb: string | null
  site_state: string | null
  updated_at: string
}

async function fetchLinkedJobIds(
  db: SupabaseClient,
  businessId: string,
  jobIds: string[],
): Promise<Set<string>> {
  if (jobIds.length === 0) return new Set()
  const linked = new Set<string>()

  const { data: posts, error: postsErr } = await db
    .from('social_posts')
    .select('job_id')
    .eq('business_id', businessId)
    .in('job_id', jobIds)
    .in('status', [...SOCIAL_POST_STATUSES])

  if (postsErr) throw new Error(postsErr.message)
  for (const row of posts ?? []) {
    if (row.job_id) linked.add(row.job_id)
  }

  const { data: renders, error: rendersErr } = await db
    .from('hybrid_social_renders')
    .select('job_id')
    .eq('business_id', businessId)
    .eq('status', 'completed')
    .in('job_id', jobIds)

  if (rendersErr) throw new Error(rendersErr.message)
  for (const row of renders ?? []) {
    if (row.job_id) linked.add(row.job_id)
  }

  return linked
}

/** Safe recent jobs for wizard - title + suburb only, no customer PII. */
export async function fetchWeekPlanRecentJobs(
  db: SupabaseClient,
  businessId: string,
  options?: { lookbackDays?: number; limit?: number },
): Promise<WeekPlanRecentJob[]> {
  const lookbackDays = options?.lookbackDays ?? SOCIAL_LOOKBACK_DAYS
  const limit = options?.limit ?? 20
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString()

  const { data: jobs, error } = await db
    .from('jobs')
    .select('id, title, stage, site_suburb, site_state, updated_at')
    .eq('business_id', businessId)
    .in('stage', [...COMPLETED_STAGES])
    .gte('updated_at', since)
    .order('updated_at', { ascending: false })
    .limit(40)

  if (error) throw new Error(error.message)

  const jobRows = (jobs ?? []) as JobRow[]
  const jobIds = jobRows.map((j) => j.id)
  const linked = await fetchLinkedJobIds(db, businessId, jobIds)

  return jobRows
    .filter((j) => !linked.has(j.id))
    .slice(0, limit)
    .map((j) => ({
      id: j.id,
      title: j.title?.trim() || 'Completed job',
      suburb: j.site_suburb?.trim() || '',
      state: j.site_state?.trim() || '',
      stage: j.stage,
    }))
}

export async function validateWeekPlanJobIds(
  db: SupabaseClient,
  businessId: string,
  jobIds: string[],
): Promise<Set<string>> {
  const unique = [...new Set(jobIds.filter(Boolean))]
  if (unique.length === 0) return new Set()

  const { data, error } = await db
    .from('jobs')
    .select('id')
    .eq('business_id', businessId)
    .in('id', unique)

  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((r) => r.id))
}
