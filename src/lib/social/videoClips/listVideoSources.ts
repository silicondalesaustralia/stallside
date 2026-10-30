import type { SupabaseClient } from '@supabase/supabase-js'
import { isVideoSourceExpired, type ClipJobLength } from './limits'
import { presignR2Url } from './r2'
import type {
  CaptionJobStatus,
  ClipJobStatus,
  VideoClipListItem,
  VideoSourceListItem,
  VideoSourceStatus,
} from './types'

type SourceRow = {
  id: string
  status: VideoSourceStatus
  title: string | null
  about_text: string | null
  storage_path: string
  duration_seconds: number | null
  file_size_bytes: number | null
  created_at: string
}

type JobRow = {
  id: string
  source_id: string
  status: ClipJobStatus
  clip_length: ClipJobLength
  progress_stage: string | null
  clips_created: number
  error_message: string | null
}

type ClipRow = {
  id: string
  source_video_id: string
  clip_title: string | null
  thumbnail_url: string | null
  original_url: string | null
  duration_seconds: number | null
  clip_score: number | null
  clip_job_id: string | null
}

const PREVIEW_URL_TTL_SECONDS = 60 * 60

async function latestCaptionJobStatus(
  db: SupabaseClient,
  assetIds: string[],
): Promise<Map<string, CaptionJobStatus>> {
  const result = new Map<string, CaptionJobStatus>()
  if (!assetIds.length) return result
  const { data, error } = await db
    .from('social_video_caption_jobs')
    .select('asset_id, status')
    .in('asset_id', assetIds)
    .order('created_at', { ascending: false })
  if (error) return result
  for (const row of (data as { asset_id: string; status: CaptionJobStatus }[] | null) ?? []) {
    if (!result.has(row.asset_id)) result.set(row.asset_id, row.status)
  }
  return result
}

export async function listVideoSources(
  db: SupabaseClient,
  businessId: string,
): Promise<VideoSourceListItem[]> {
  const { data: sources, error } = await db
    .from('social_video_sources')
    .select('id, status, title, about_text, storage_path, duration_seconds, file_size_bytes, created_at')
    .eq('business_id', businessId)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)

  const rows = (sources as SourceRow[] | null) ?? []
  if (!rows.length) return []
  const ids = rows.map((r) => r.id)

  const [{ data: jobs }, { data: clips }] = await Promise.all([
    db
      .from('social_video_clip_jobs')
      .select('id, source_id, status, clip_length, progress_stage, clips_created, error_message')
      .in('source_id', ids)
      .order('created_at', { ascending: false }),
    db
      .from('social_media_assets')
      .select('id, source_video_id, clip_title, thumbnail_url, original_url, duration_seconds, clip_score, clip_job_id')
      .in('source_video_id', ids)
      .eq('status', 'ready')
      .order('clip_start_seconds', { ascending: true }),
  ])

  const latestJob = new Map<string, JobRow>()
  const fullJobIds = new Set<string>()
  for (const job of (jobs as JobRow[] | null) ?? []) {
    if (!latestJob.has(job.source_id)) latestJob.set(job.source_id, job)
    if (job.clip_length === 'full') fullJobIds.add(job.id)
  }

  const clipRows = (clips as ClipRow[] | null) ?? []
  const captionStatus = await latestCaptionJobStatus(db, clipRows.map((c) => c.id))

  const clipsBySource = new Map<string, VideoClipListItem[]>()
  for (const c of clipRows) {
    const list = clipsBySource.get(c.source_video_id) ?? []
    list.push({
      id: c.id,
      title: c.clip_title,
      thumbnailUrl: c.thumbnail_url,
      originalUrl: c.original_url,
      durationSeconds: c.duration_seconds != null ? Number(c.duration_seconds) : null,
      score: c.clip_score,
      captionJobStatus: captionStatus.get(c.id) ?? null,
      fullVideo: c.clip_job_id != null && fullJobIds.has(c.clip_job_id),
    })
    clipsBySource.set(c.source_video_id, list)
  }

  return rows.map((r) => {
    const job = latestJob.get(r.id)
    const expired = isVideoSourceExpired(r.created_at)
    return {
      id: r.id,
      status: r.status,
      title: r.title,
      aboutText: r.about_text,
      durationSeconds: r.duration_seconds != null ? Number(r.duration_seconds) : null,
      fileSizeBytes: r.file_size_bytes != null ? Number(r.file_size_bytes) : null,
      previewUrl: expired ? null : presignR2Url('GET', r.storage_path, PREVIEW_URL_TTL_SECONDS),
      expired,
      createdAt: r.created_at,
      latestJob: job
        ? {
            id: job.id,
            status: job.status,
            clipLength: job.clip_length,
            progressStage: job.progress_stage,
            clipsCreated: job.clips_created,
            errorMessage: job.error_message,
          }
        : null,
      clips: clipsBySource.get(r.id) ?? [],
    }
  })
}
