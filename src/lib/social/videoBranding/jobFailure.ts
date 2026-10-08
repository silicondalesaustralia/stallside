import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Mark a branding job failed and set a retryable asset state.
 * If a previous branded output exists, restore asset to `processed` so the
 * customer keeps access to the last good branded video after a reprocess failure.
 */
export async function markBrandingJobFailed(
  db: SupabaseClient,
  input: {
    jobId: string
    assetId: string
    errorCode: string
    errorMessage: string
    forceProcessingFailed?: boolean
  },
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .from('social_video_processing_jobs')
    .update({
      status: 'failed',
      error_code: input.errorCode.slice(0, 80),
      error_message: input.errorMessage.slice(0, 500),
      completed_at: now,
      updated_at: now,
    })
    .eq('id', input.jobId)

  const { data: asset } = await db
    .from('social_media_assets')
    .select('processed_storage_path, processing_status')
    .eq('id', input.assetId)
    .maybeSingle()

  if (asset?.processing_status !== 'processing') {
    return
  }

  const hasPreviousProcessed = Boolean(asset.processed_storage_path?.trim())
  const nextStatus =
    input.forceProcessingFailed || !hasPreviousProcessed ? 'processing_failed' : 'processed'

  await db
    .from('social_media_assets')
    .update({
      processing_status: nextStatus,
      updated_at: now,
    })
    .eq('id', input.assetId)
    .eq('processing_status', 'processing')
}
