export type SocialMediaAssetStatus = 'uploading' | 'ready' | 'failed' | 'deleted'

export type VideoProcessingStatus = 'none' | 'processing' | 'processed' | 'processing_failed'

export type SocialMediaAssetRow = {
  id: string
  business_id: string
  job_id: string | null
  media_type: 'video'
  status: SocialMediaAssetStatus
  original_url: string | null
  processed_url: string | null
  processed_storage_path: string | null
  processing_status: VideoProcessingStatus
  branding_config: Record<string, unknown> | null
  thumbnail_url: string | null
  storage_path: string | null
  thumbnail_path: string | null
  duration_seconds: number | null
  mime_type: string | null
  file_size_bytes: number | null
  caption: string | null
  about_text: string | null
  created_at: string
  updated_at: string
}

export type SocialMediaAssetListItem = {
  id: string
  mediaType: 'video'
  status: SocialMediaAssetStatus
  originalUrl: string | null
  processedUrl: string | null
  processingStatus: VideoProcessingStatus
  thumbnailUrl: string | null
  durationSeconds: number | null
  mimeType: string | null
  fileSizeBytes: number | null
  caption: string | null
  aboutText: string | null
  jobId: string | null
  jobTitle: string | null
  jobSuburb: string | null
  brandingConfig: Record<string, unknown> | null
  createdAt: string
}

export function mapMediaAssetRow(
  row: SocialMediaAssetRow & {
    jobs?: { title?: string | null; site_suburb?: string | null } | null
  },
): SocialMediaAssetListItem {
  const job = row.jobs && !Array.isArray(row.jobs) ? row.jobs : null
  return {
    id: row.id,
    mediaType: 'video',
    status: row.status,
    originalUrl: row.original_url,
    processedUrl: row.processed_url,
    processingStatus: row.processing_status ?? 'none',
    thumbnailUrl: row.thumbnail_url,
    durationSeconds:
      row.duration_seconds != null ? Number(row.duration_seconds) : null,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes != null ? Number(row.file_size_bytes) : null,
    caption: row.caption,
    aboutText: row.about_text,
    jobId: row.job_id,
    jobTitle: typeof job?.title === 'string' ? job.title.trim() || null : null,
    jobSuburb:
      typeof job?.site_suburb === 'string' ? job.site_suburb.trim() || null : null,
    brandingConfig: row.branding_config ?? null,
    createdAt: row.created_at,
  }
}
