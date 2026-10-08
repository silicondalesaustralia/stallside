export const VIDEO_LOGO_POSITIONS = [
  'top_left',
  'top_right',
  'bottom_left',
  'bottom_right',
] as const

export type VideoLogoPosition = (typeof VIDEO_LOGO_POSITIONS)[number]

export const VIDEO_LOGO_SIZES = ['small', 'medium', 'large'] as const

export type VideoLogoSize = (typeof VIDEO_LOGO_SIZES)[number]

export const VIDEO_TEXT_POSITIONS = ['top', 'center', 'bottom'] as const

export type VideoTextPosition = (typeof VIDEO_TEXT_POSITIONS)[number]

export const VIDEO_HEADLINE_FONT_IDS = [
  'inter',
  'roboto',
  'open-sans',
  'oswald',
  'bebas-neue',
  'anton',
  'fjalla-one',
] as const

export type VideoHeadlineFontId = (typeof VIDEO_HEADLINE_FONT_IDS)[number]

export const VIDEO_HEADLINE_SIZES = ['small', 'medium', 'large'] as const

export type VideoHeadlineSize = (typeof VIDEO_HEADLINE_SIZES)[number]

export const VIDEO_HEADLINE_WEIGHTS = ['regular', 'bold'] as const

export type VideoHeadlineWeight = (typeof VIDEO_HEADLINE_WEIGHTS)[number]

export const VIDEO_HEADLINE_ALIGNS = ['left', 'center', 'right'] as const

export type VideoHeadlineAlign = (typeof VIDEO_HEADLINE_ALIGNS)[number]

export const VIDEO_HEADLINE_BACKGROUNDS = ['auto', 'none'] as const

export type VideoHeadlineBackground = (typeof VIDEO_HEADLINE_BACKGROUNDS)[number]

export const VIDEO_PROCESSING_STATUSES = [
  'none',
  'processing',
  'processed',
  'processing_failed',
] as const

export type VideoProcessingStatus = (typeof VIDEO_PROCESSING_STATUSES)[number]

export const VIDEO_JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const

export type VideoJobStatus = (typeof VIDEO_JOB_STATUSES)[number]

export type VideoLogoChoiceKind = 'none' | 'primary' | 'asset'

export type VideoBrandingConfig = {
  logoChoice: VideoLogoChoiceKind
  logoAssetId: string | null
  logoPosition: VideoLogoPosition | null
  logoSize: VideoLogoSize | null
  overlayText: string | null
  textPosition: VideoTextPosition | null
  overlayTextFont?: VideoHeadlineFontId | null
  overlayTextSize?: VideoHeadlineSize | null
  overlayTextColor?: string | null
  overlayTextWeight?: VideoHeadlineWeight | null
  overlayTextAlign?: VideoHeadlineAlign | null
  overlayTextBackground?: VideoHeadlineBackground | null
}

export type VideoProcessingJobRow = {
  id: string
  asset_id: string
  business_id: string
  status: VideoJobStatus
  logo_choice: VideoLogoChoiceKind
  logo_asset_id: string | null
  logo_position: VideoLogoPosition | null
  logo_size: VideoLogoSize | null
  overlay_text: string | null
  text_position: VideoTextPosition | null
  output_storage_path: string
  output_version: number
  previous_processed_path: string | null
  error_code: string | null
  error_message: string | null
  claimed_at: string | null
  worker_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}
