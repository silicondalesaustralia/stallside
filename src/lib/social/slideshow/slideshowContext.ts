import type { SupabaseClient } from '@supabase/supabase-js'

export type SlideshowBusiness = { name: string; brandColor: string | null }
export type SlideshowItem = { title: string | null; description: string | null; suburb: string | null }

export async function loadSlideshowBusiness(db: SupabaseClient, businessId: string): Promise<SlideshowBusiness | null> {
  const { data, error } = await db.from('businesses').select('name, brand_color').eq('id', businessId).maybeSingle()
  if (error) throw new Error(`Could not load your business: ${error.message}`)
  if (!data) return null
  return {
    name: (data.name as string | null)?.trim() || 'Our team',
    brandColor: (data.brand_color as string | null) ?? null,
  }
}

/** The linked product / pre-order page (mirrored into `jobs`), for extra facts. */
export async function loadSlideshowItem(
  db: SupabaseClient,
  businessId: string,
  jobId: string | null,
): Promise<SlideshowItem | null> {
  if (!jobId) return null
  const { data, error } = await db
    .from('jobs')
    .select('title, description, site_suburb')
    .eq('id', jobId)
    .eq('business_id', businessId)
    .maybeSingle()
  if (error) throw new Error(`Could not load the linked item: ${error.message}`)
  if (!data) return null
  return {
    title: (data.title as string | null) ?? null,
    description: (data.description as string | null) ?? null,
    suburb: (data.site_suburb as string | null) ?? null,
  }
}

/** A job id from the client is only kept when it belongs to this business. */
export async function ownedJobId(db: SupabaseClient, businessId: string, jobId: string | null): Promise<string | null> {
  return (await loadSlideshowItem(db, businessId, jobId)) ? jobId : null
}
