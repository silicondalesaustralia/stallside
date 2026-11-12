import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlatformCaptionsRequest } from '@/lib/social/platformCaptions/platformCaptionTypes'

const text = (v: unknown, max = 600): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)

/** Short top-level text fields from a Library render's content (headline, body, caption...). */
function renderText(content: unknown): string[] {
  if (!content || typeof content !== 'object') return []
  return Object.entries(content as Record<string, unknown>)
    .filter(([key, value]) => typeof value === 'string' && !/url|path|color|font|style/i.test(key))
    .slice(0, 8)
    .map(([key, value]) => `${key}: ${text(value, 300)}`)
}

/** Facts the AI may use: business, linked item, Library video or image text. Never throws on missing rows. */
export async function loadPlatformCaptionContext(
  db: SupabaseClient,
  businessId: string,
  request: Pick<PlatformCaptionsRequest, 'jobId' | 'renderId' | 'assetId'>,
): Promise<{ businessName: string; lines: string[] }> {
  const { data: business, error: bizErr } = await db.from('businesses').select('*').eq('id', businessId).single()
  if (bizErr || !business) throw new Error('Business not found')
  const businessName = text(business.name, 120) ?? 'Our business'
  const lines = [
    `Business: ${businessName}${text(business.business_type, 80) ? ` (${business.business_type})` : ''}`,
    `Location: ${[text(business.suburb, 80), text(business.state, 40)].filter(Boolean).join(', ') || 'Australia'}`,
  ]
  if (text(business.social_brand_voice)) lines.push(`Brand voice: ${business.social_brand_voice}`)
  if (text(business.social_default_cta)) lines.push(`Call to action: ${business.social_default_cta}`)
  if (text(business.website)) lines.push(`Website: ${business.website}`)
  if (text(business.social_hashtag_template)) lines.push(`Preferred hashtags: ${business.social_hashtag_template}`)

  let jobId = request.jobId
  if (request.renderId) {
    const { data: render } = await db
      .from('hybrid_social_renders')
      .select('content, job_id')
      .eq('id', request.renderId)
      .eq('business_id', businessId)
      .maybeSingle()
    if (render) {
      lines.push(...renderText(render.content).map((l) => `Image text - ${l}`))
      jobId = jobId ?? text(render.job_id, 100)
    }
  }
  if (request.assetId) {
    const { data: asset } = await db
      .from('social_media_assets')
      .select('about_text, clip_title, job_id')
      .eq('id', request.assetId)
      .eq('business_id', businessId)
      .maybeSingle()
    if (asset) {
      if (text(asset.clip_title)) lines.push(`Video title: ${asset.clip_title}`)
      if (text(asset.about_text, 1500)) lines.push(`What the video shows: ${text(asset.about_text, 1500)}`)
      jobId = jobId ?? text(asset.job_id, 100)
    }
  }
  if (jobId) {
    const { data: job } = await db
      .from('jobs')
      .select('title, description, notes, site_suburb')
      .eq('id', jobId)
      .eq('business_id', businessId)
      .maybeSingle()
    if (job) {
      if (text(job.title)) lines.push(`Product or offer: ${job.title}`)
      const details = [text(job.description, 800), text(job.notes, 400)].filter(Boolean).join(' ')
      if (details) lines.push(`Details: ${details}`)
      if (text(job.site_suburb)) lines.push(`Item location: ${job.site_suburb}`)
    }
  }
  return { businessName, lines }
}
