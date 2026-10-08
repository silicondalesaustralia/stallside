import {
  tiktokDraftBlockReason,
  type TikTokCreatorInfo,
  type TikTokSettingsDraft,
} from '@/lib/social/tiktok/tiktokSettings'

/** Why TikTok can't be posted yet, or null. Only applies when TikTok is selected and connected. */
export function composerTikTokBlockReason(params: {
  active: boolean
  loading: boolean
  error: string | null
  creator: TikTokCreatorInfo | null
  draft: TikTokSettingsDraft
  videoDurationSeconds: number | null
}): string | null {
  if (!params.active) return null
  if (params.loading) return 'Loading your TikTok account…'
  if (params.error || !params.creator) return params.error || 'TikTok account unavailable.'
  const max = params.creator.maxVideoPostDurationSec
  if (params.videoDurationSeconds != null && params.videoDurationSeconds > max) {
    return `Video is longer than TikTok allows for your account (${max}s).`
  }
  return tiktokDraftBlockReason(params.draft)
}
