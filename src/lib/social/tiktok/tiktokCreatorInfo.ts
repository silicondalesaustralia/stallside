import { tiktokPost } from '@/lib/social/tiktok/tiktokApi'
import {
  isTikTokPrivacyLevel,
  type TikTokCreatorInfo,
} from '@/lib/social/tiktok/tiktokSettings'

type RawCreatorInfo = {
  creator_avatar_url?: string
  creator_username?: string
  creator_nickname?: string
  privacy_level_options?: string[]
  comment_disabled?: boolean
  duet_disabled?: boolean
  stitch_disabled?: boolean
  max_video_post_duration_sec?: number
}

export function mapCreatorInfo(raw: RawCreatorInfo): TikTokCreatorInfo {
  return {
    creatorNickname: raw.creator_nickname ?? '',
    creatorUsername: raw.creator_username ?? '',
    creatorAvatarUrl: raw.creator_avatar_url ?? null,
    privacyLevelOptions: (raw.privacy_level_options ?? []).filter(isTikTokPrivacyLevel),
    commentDisabled: raw.comment_disabled === true,
    duetDisabled: raw.duet_disabled === true,
    stitchDisabled: raw.stitch_disabled === true,
    maxVideoPostDurationSec: raw.max_video_post_duration_sec ?? 60,
  }
}

/** Must be called before every Direct Post (TikTok UX guideline 1). */
export async function queryTikTokCreatorInfo(accessToken: string): Promise<TikTokCreatorInfo> {
  const raw = await tiktokPost<RawCreatorInfo>('/post/publish/creator_info/query/', accessToken, {})
  return mapCreatorInfo(raw)
}

export const DEMO_TIKTOK_CREATOR_INFO: TikTokCreatorInfo = {
  creatorNickname: 'Demo Tradie',
  creatorUsername: 'demo.tradie',
  creatorAvatarUrl: null,
  privacyLevelOptions: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'],
  commentDisabled: false,
  duetDisabled: false,
  stitchDisabled: false,
  maxVideoPostDurationSec: 600,
}
