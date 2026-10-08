import type { SupabaseClient } from '@supabase/supabase-js'
import type { DesignedCaptionJob } from '@/lib/social/designedCaptionContext'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Safe job fields for caption generation - no customer PII or pricing. */
export const CAPTION_SAFE_JOB_SELECT = 'id, title, notes, site_suburb, site_state, stage'

export type MediaAssetJobResolveResult =
  | { ok: true; jobId: string | null }
  | { ok: false; error: string; status: number }

export async function resolveMediaAssetJobId(
  db: SupabaseClient,
  businessId: string,
  jobId: unknown,
): Promise<MediaAssetJobResolveResult> {
  if (jobId == null || jobId === '') {
    return { ok: true, jobId: null }
  }
  if (typeof jobId !== 'string' || !UUID_RE.test(jobId.trim())) {
    return { ok: false, error: 'Invalid job', status: 400 }
  }

  const trimmed = jobId.trim()
  const { data, error } = await db
    .from('jobs')
    .select('id')
    .eq('id', trimmed)
    .eq('business_id', businessId)
    .maybeSingle()

  if (error) {
    console.error('[MediaAssets] job lookup failed', error.message)
    return { ok: false, error: 'Could not validate job', status: 500 }
  }
  if (!data) {
    return { ok: false, error: 'Job not found', status: 404 }
  }

  return { ok: true, jobId: trimmed }
}

export async function loadSafeCaptionJob(
  db: SupabaseClient,
  businessId: string,
  jobId: string | null | undefined,
): Promise<DesignedCaptionJob | null> {
  if (!jobId?.trim()) return null

  const { data, error } = await db
    .from('jobs')
    .select(CAPTION_SAFE_JOB_SELECT)
    .eq('id', jobId.trim())
    .eq('business_id', businessId)
    .maybeSingle()

  if (error || !data) {
    if (error) console.warn('[MediaAssets] safe job fetch failed', error.message)
    return null
  }

  const notes =
    typeof data.notes === 'string' && data.notes.trim()
      ? data.notes.trim().slice(0, 500)
      : null

  return {
    title: typeof data.title === 'string' ? data.title.trim() || null : null,
    description: notes,
    suburb: typeof data.site_suburb === 'string' ? data.site_suburb.trim() || null : null,
    state: typeof data.site_state === 'string' ? data.site_state.trim() || null : null,
  }
}

export function formatRelatedJobLabel(input: {
  title?: string | null
  suburb?: string | null
}): string | null {
  const title = input.title?.trim()
  const suburb = input.suburb?.trim()
  if (!title && !suburb) return null
  if (title && suburb) return `${title} · ${suburb}`
  return title || suburb || null
}
