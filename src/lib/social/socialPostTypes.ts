export const SOCIAL_POST_STATUSES = [
  'draft',
  'scheduled',
  'posted',
  'failed',
  'cancelled',
] as const

export type SocialPostStatus = (typeof SOCIAL_POST_STATUSES)[number]

export const SOCIAL_PUBLISHING_MODES = ['automatic', 'manual'] as const

export type SocialPublishingMode = (typeof SOCIAL_PUBLISHING_MODES)[number]

export type SocialPostRow = {
  id: string
  business_id: string
  status: SocialPostStatus
  publishing_mode: SocialPublishingMode
  caption: string | null
  platforms: string[]
  photo_urls: string[] | null
  processed_photo_urls: Record<string, string[]> | null
  scheduled_for: string | null
  posted_at: string | null
  posted_manually: boolean
  week_plan_item_id: string | null
  job_id: string | null
}

export function parsePublishingMode(raw: unknown): SocialPublishingMode | null {
  if (raw === 'automatic' || raw === 'manual') return raw
  return null
}

export function parseSocialPostStatus(raw: unknown): SocialPostStatus | null {
  if (typeof raw !== 'string') return null
  return SOCIAL_POST_STATUSES.includes(raw as SocialPostStatus)
    ? (raw as SocialPostStatus)
    : null
}

export function isPublishedHistoryImmutable(post: Pick<SocialPostRow, 'status'>): boolean {
  return post.status === 'posted'
}

export function isDueAutomaticPost(post: Pick<SocialPostRow, 'status' | 'publishing_mode'>): boolean {
  return post.status === 'scheduled' && post.publishing_mode === 'automatic'
}
