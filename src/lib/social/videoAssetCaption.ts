import type { SupabaseClient } from '@supabase/supabase-js'
import type { DesignedCaptionBusiness } from '@/lib/social/designedCaptionContext'
import { loadSafeCaptionJob } from '@/lib/social/mediaAssetJob'
import { generateVideoCaption } from '@/lib/social/generateVideoCaption'
import { clipScriptText } from '@/lib/social/videoClips/clipScript'
import { clipOverlayTexts } from '@/lib/social/videoClips/clipOverlayText'

type Result =
  | { ok: true; caption: string; title: string | null }
  | { ok: false; status: number; error: string }

const text = (v: unknown): string | null => (typeof v === 'string' ? v.trim() || null : null)

export function captionBusinessFromRow(row: Record<string, unknown>): DesignedCaptionBusiness {
  return {
    name: text(row.name) || 'Our Business',
    services: text(row.ai_agent_services),
    suburb: text(row.suburb),
    brandVoice: text(row.social_brand_voice),
    cta: text(row.social_default_cta),
    phone: text(row.phone),
    website: text(row.website),
  }
}

async function loadSourceVideo(db: SupabaseClient, businessId: string, sourceId: string | null) {
  if (!sourceId) return null
  const { data, error } = await db
    .from('social_video_sources')
    .select('title')
    .eq('id', sourceId)
    .eq('business_id', businessId)
    .maybeSingle()
  if (error) console.warn('[GenerateCaption] Source video fetch failed (non-fatal)', error.message)
  return data ? { title: text(data.title) } : null
}

/** "Write with AI" for a Library video: reads the saved edit (script, on-screen text, names) fresh each time. */
export async function captionForVideoAsset(
  db: SupabaseClient,
  businessId: string,
  assetId: string,
  business: DesignedCaptionBusiness,
): Promise<Result> {
  const { data: asset, error } = await db
    .from('social_media_assets')
    .select('id, about_text, job_id, status, media_type, captions, clip_title, source_video_id')
    .eq('id', assetId)
    .eq('business_id', businessId)
    .maybeSingle()
  if (error) {
    console.error('[GenerateCaption] Video asset fetch failed', error.message)
    return { ok: false, status: 500, error: 'Could not load video asset' }
  }
  if (!asset || asset.media_type !== 'video') return { ok: false, status: 404, error: 'Video asset not found' }
  if (asset.status !== 'ready') return { ok: false, status: 409, error: 'Video is not ready for captioning' }

  const sourceVideoId = text(asset.source_video_id)
  const clipTitle = text(asset.clip_title)
  const [job, source] = await Promise.all([
    loadSafeCaptionJob(db, businessId, asset.job_id),
    loadSourceVideo(db, businessId, sourceVideoId),
  ])
  const script = asset.captions ? clipScriptText(asset.captions) || null : null
  const overlayTexts = asset.captions ? clipOverlayTexts(asset.captions) : []

  const result = await generateVideoCaption({
    businessId,
    aboutText: text(asset.about_text),
    script,
    overlayTexts,
    sourceTitle: source?.title ?? null,
    clipTitle,
    business,
    job,
  })

  if (sourceVideoId && result.title && result.title !== clipTitle) {
    const { error: renameErr } = await db
      .from('social_media_assets')
      .update({ clip_title: result.title })
      .eq('id', assetId)
      .eq('business_id', businessId)
    if (renameErr) console.warn('[GenerateCaption] Clip rename failed (non-fatal)', renameErr.message)
  }

  console.log('[GenerateCaption] Video caption ready', {
    assetId,
    scriptChars: script?.length ?? 0,
    overlays: overlayTexts.length,
    hasSourceTitle: Boolean(source?.title),
    hasTitle: Boolean(result.title),
    hasJob: Boolean(job),
  })
  return { ok: true, caption: result.caption, title: result.title }
}
