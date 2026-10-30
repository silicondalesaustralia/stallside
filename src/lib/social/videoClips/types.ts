import type { ClipAspect, ClipJobLength } from './limits'
import type { CaptionPosition, CaptionStyleId } from './captionStyles'

export type VideoSourceStatus = 'uploading' | 'ready' | 'failed'

export type ClipJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export type ClipJobRow = {
  id: string
  source_id: string
  business_id: string
  status: ClipJobStatus
  clip_count: number
  clip_length: ClipJobLength
  aspect: ClipAspect
  caption_style: CaptionStyleId
  caption_position: CaptionPosition
  clips_created: number
  progress_stage: string | null
  error_code: string | null
  error_message: string | null
  claimed_at: string | null
  worker_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type TranscriptWord = { w: string; s: number; e: number }

export type TranscriptSegment = { start: number; end: number; text: string }

export type Transcript = {
  text: string
  segments: TranscriptSegment[]
  words: TranscriptWord[]
}

export type ClipMoment = {
  start: number
  end: number
  title: string
  /** AI engagement score; null for whole-video jobs. */
  score: number | null
}

export type VideoClipListItem = {
  id: string
  title: string | null
  thumbnailUrl: string | null
  originalUrl: string | null
  durationSeconds: number | null
  score: number | null
  captionJobStatus: CaptionJobStatus | null
  /** Made by "Use whole video" (not an AI-picked moment). */
  fullVideo: boolean
}

export type CaptionJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type CaptionJobRow = {
  id: string
  asset_id: string
  business_id: string
  status: CaptionJobStatus
  claimed_at: string | null
}

export type VideoSourceListItem = {
  id: string
  status: VideoSourceStatus
  title: string | null
  aboutText: string | null
  durationSeconds: number | null
  fileSizeBytes: number | null
  previewUrl: string | null
  expired: boolean
  createdAt: string
  latestJob: {
    id: string
    status: ClipJobStatus
    clipLength: ClipJobLength
    progressStage: string | null
    clipsCreated: number
    errorMessage: string | null
  } | null
  clips: VideoClipListItem[]
}
