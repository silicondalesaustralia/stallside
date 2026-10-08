import type { SupabaseClient } from '@supabase/supabase-js'
import type { VendlContentDetail } from '@/lib/socialHost/vendlContentDetail'

type LinkParams = {
  db: SupabaseClient
  businessId: string
  externalRef: string
  detail: VendlContentDetail
  locationLabel: string | null
}

async function findLinkedJobId(db: SupabaseClient, businessId: string, externalRef: string): Promise<string | null> {
  const { data, error } = await db
    .from('jobs')
    .select('id')
    .eq('business_id', businessId)
    .eq('external_ref', externalRef)
    .maybeSingle()
  if (error) throw new Error(`[vendlContent] job lookup failed: ${error.message}`)
  return (data?.id as string | undefined) ?? null
}

/**
 * Mirrors a Vendl item into social jobs + job_photos (one row per item, refreshed
 * on every link) so captions, AI images and the planner can use it as context.
 */
export async function linkVendlContentToJob({
  db,
  businessId,
  externalRef,
  detail,
  locationLabel,
}: LinkParams): Promise<string> {
  const fields = {
    title: detail.title.slice(0, 200),
    description: detail.description,
    notes: detail.notes,
    job_category: detail.kind,
    stage: 'job_done',
    site_suburb: locationLabel,
    updated_at: new Date().toISOString(),
  }

  let jobId = await findLinkedJobId(db, businessId, externalRef)
  if (jobId) {
    const { error } = await db.from('jobs').update(fields).eq('id', jobId)
    if (error) throw new Error(`[vendlContent] job update failed: ${error.message}`)
  } else {
    const { data, error } = await db
      .from('jobs')
      .insert({ ...fields, business_id: businessId, external_ref: externalRef })
      .select('id')
      .single()
    if (error?.code === '23505') {
      jobId = await findLinkedJobId(db, businessId, externalRef)
    } else if (error || !data) {
      throw new Error(`[vendlContent] job insert failed: ${error?.message ?? 'unknown'}`)
    } else {
      jobId = data.id as string
    }
  }
  if (!jobId) throw new Error('[vendlContent] linked job missing after insert race')

  const { error: deleteError } = await db.from('job_photos').delete().eq('job_id', jobId)
  if (deleteError) throw new Error(`[vendlContent] photo reset failed: ${deleteError.message}`)
  if (detail.imageUrls.length) {
    const rows = detail.imageUrls.map((url) => ({
      job_id: jobId,
      business_id: businessId,
      url,
      stage_at_upload: 'job_done',
      suburb: locationLabel,
    }))
    const { error: photoError } = await db.from('job_photos').insert(rows)
    if (photoError) throw new Error(`[vendlContent] photo insert failed: ${photoError.message}`)
  }
  return jobId
}
