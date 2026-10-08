import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getBrandLogoForBusiness,
  listBrandLogoRows,
  resolveRecreateLogoAsset,
  type RecreateLogoChoice,
} from '@/lib/brand/businessBrandLogos'
import { buildSocialVideoProcessedPath, requirePublicSocialPostsUrl, resolvePublicSocialPostsUrl } from '@/lib/social/socialVideoStorage'
import type { VideoBrandingConfig, VideoProcessingJobRow } from '@/lib/social/videoBranding/types'
import {
  BRANDING_IN_PROGRESS_ERROR,
  isPostgresUniqueViolation,
} from '@/lib/social/videoBranding/dbErrors'
import {
  brandingConfigToJobFields,
  parseVideoBrandingRequest,
} from '@/lib/social/videoBranding/validation'

export type CreateVideoProcessingJobResult =
  | { ok: true; jobId: string; outputVersion: number }
  | { ok: false; error: string; status: number }

export async function createVideoProcessingJob(
  db: SupabaseClient,
  input: {
    businessId: string
    assetId: string
    config: VideoBrandingConfig
    defaultLogoCorner?: string | null
    fallbackLogoUrl?: string | null
  },
): Promise<CreateVideoProcessingJobResult> {
  const { businessId, assetId, config } = input

  const { data: asset, error: assetErr } = await db
    .from('social_media_assets')
    .select(
      'id, business_id, status, storage_path, processing_status, processed_storage_path',
    )
    .eq('id', assetId)
    .maybeSingle()

  if (assetErr) {
    console.error('[VideoBranding] asset fetch failed', assetErr.message)
    return { ok: false, error: 'Could not start branding', status: 500 }
  }

  if (!asset || asset.business_id !== businessId) {
    return { ok: false, error: 'Not found', status: 404 }
  }

  if (asset.status !== 'ready' || !asset.storage_path?.trim()) {
    return { ok: false, error: 'Video is not ready for branding', status: 409 }
  }

  if (asset.processing_status === 'processing') {
    return { ok: false, error: BRANDING_IN_PROGRESS_ERROR, status: 409 }
  }

  const { data: activeJob } = await db
    .from('social_video_processing_jobs')
    .select('id')
    .eq('asset_id', assetId)
    .in('status', ['pending', 'processing'])
    .limit(1)
    .maybeSingle()

  if (activeJob) {
    return { ok: false, error: BRANDING_IN_PROGRESS_ERROR, status: 409 }
  }

  if (config.logoChoice === 'asset' && config.logoAssetId) {
    const logo = await getBrandLogoForBusiness(db, businessId, config.logoAssetId)
    if (!logo) {
      return { ok: false, error: 'Logo not found', status: 400 }
    }
  } else if (config.logoChoice === 'primary') {
    const rows = await listBrandLogoRows(db, businessId)
    if (!rows.length && !input.fallbackLogoUrl?.trim()) {
      return { ok: false, error: 'No business logo available', status: 400 }
    }
  }

  const { count } = await db
    .from('social_video_processing_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('asset_id', assetId)

  const outputVersion = (count ?? 0) + 1
  const jobId = randomUUID()
  const outputPath = buildSocialVideoProcessedPath(businessId, assetId, jobId)
  const previousProcessedPath = asset.processed_storage_path?.trim() || null

  const jobFields = brandingConfigToJobFields(config)
  const now = new Date().toISOString()

  const { data: job, error: jobErr } = await db
    .from('social_video_processing_jobs')
    .insert({
      id: jobId,
      asset_id: assetId,
      business_id: businessId,
      status: 'pending',
      ...jobFields,
      output_storage_path: outputPath,
      output_version: outputVersion,
      previous_processed_path: previousProcessedPath,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (jobErr || !job) {
    if (isPostgresUniqueViolation(jobErr)) {
      return { ok: false, error: BRANDING_IN_PROGRESS_ERROR, status: 409 }
    }
    console.error('[VideoBranding] job insert failed', jobErr?.message)
    return { ok: false, error: 'Could not start branding', status: 500 }
  }

  const { error: assetUpdateErr } = await db
    .from('social_media_assets')
    .update({
      processing_status: 'processing',
      branding_config: config,
      updated_at: now,
    })
    .eq('id', assetId)
    .eq('business_id', businessId)

  if (assetUpdateErr) {
    console.error('[VideoBranding] asset status update failed', assetUpdateErr.message)
    await db
      .from('social_video_processing_jobs')
      .update({ status: 'cancelled', updated_at: now })
      .eq('id', job.id)
    return { ok: false, error: 'Could not start branding', status: 500 }
  }

  return { ok: true, jobId: job.id, outputVersion }
}

export async function resolveLogoChoiceForWorker(
  db: SupabaseClient,
  businessId: string,
  job: Pick<VideoProcessingJobRow, 'logo_choice' | 'logo_asset_id'>,
  fallbackLogoUrl?: string | null,
): Promise<{ storagePath: string | null; fetchUrl: string | null }> {
  if (job.logo_choice === 'none') {
    return { storagePath: null, fetchUrl: null }
  }

  const choice: RecreateLogoChoice =
    job.logo_choice === 'primary'
      ? { kind: 'primary' }
      : job.logo_asset_id
        ? { kind: 'asset', id: job.logo_asset_id }
        : { kind: 'none' }

  const resolved = await resolveRecreateLogoAsset(db, businessId, choice, fallbackLogoUrl)
  if (!resolved.applyRealLogo || !resolved.asset) {
    return { storagePath: resolved.asset?.storage_path ?? null, fetchUrl: resolved.fetchUrl }
  }

  return {
    storagePath: resolved.asset.storage_path,
    fetchUrl: resolved.fetchUrl,
  }
}

export function processedPublicUrl(storagePath: string, db?: SupabaseClient): string {
  return resolvePublicSocialPostsUrl(db, storagePath)
}

export function requireProcessedPublicUrl(storagePath: string, db?: SupabaseClient): string {
  return requirePublicSocialPostsUrl(db, storagePath)
}

export function parseBrandingRequestBody(
  body: Record<string, unknown>,
  defaultLogoCorner?: string | null,
  businessDefaults?: import('@/lib/social/videoBranding/headlineStyle').VideoHeadlineBusinessDefaults,
) {
  return parseVideoBrandingRequest({
    logoAssetId: body.logoAssetId,
    logoPosition: body.logoPosition,
    logoSize: body.logoSize,
    overlayText: body.overlayText,
    textPosition: body.textPosition,
    overlayTextFont: body.overlayTextFont,
    overlayTextSize: body.overlayTextSize,
    overlayTextColor: body.overlayTextColor,
    overlayTextWeight: body.overlayTextWeight,
    overlayTextAlign: body.overlayTextAlign,
    overlayTextBackground: body.overlayTextBackground,
    defaultLogoCorner,
    businessDefaults,
  })
}

export { BRANDING_IN_PROGRESS_ERROR }
