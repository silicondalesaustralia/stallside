import { tiktokPost } from '@/lib/social/tiktok/tiktokApi'

export type TikTokPublishStatus =
  | 'PROCESSING_UPLOAD'
  | 'PROCESSING_DOWNLOAD'
  | 'SEND_TO_USER_INBOX'
  | 'PUBLISH_COMPLETE'
  | 'FAILED'

export type TikTokStatusSnapshot = {
  status: string
  failReason: string | null
  publicPostIds: string[]
}

export async function fetchTikTokPublishStatus(
  accessToken: string,
  publishId: string,
): Promise<TikTokStatusSnapshot> {
  const data = await tiktokPost<{
    status?: string
    fail_reason?: string
    publicaly_available_post_id?: Array<string | number>
  }>('/post/publish/status/fetch/', accessToken, { publish_id: publishId })
  return {
    status: data.status ?? 'PROCESSING_UPLOAD',
    failReason: data.fail_reason ?? null,
    publicPostIds: (data.publicaly_available_post_id ?? []).map(String),
  }
}

export type TikTokStatusColumns = {
  tiktok_status: string
  tiktok_post_id?: string
  tiktok_error?: string
}

/** Terminal = TikTok will not change the status any further. */
export function isTerminalTikTokStatus(status: string): boolean {
  return status === 'PUBLISH_COMPLETE' || status === 'FAILED' || status === 'SEND_TO_USER_INBOX'
}

/**
 * Private (SELF_ONLY / unaudited) posts complete without a public post id,
 * so the publish_id stands in as the success marker.
 */
export function tiktokStatusColumns(
  publishId: string,
  snapshot: TikTokStatusSnapshot,
): TikTokStatusColumns {
  if (snapshot.status === 'PUBLISH_COMPLETE' || snapshot.status === 'SEND_TO_USER_INBOX') {
    return { tiktok_status: snapshot.status, tiktok_post_id: snapshot.publicPostIds[0] ?? publishId }
  }
  if (snapshot.status === 'FAILED') {
    return {
      tiktok_status: snapshot.status,
      tiktok_error: tiktokFailReasonMessage(snapshot.failReason),
    }
  }
  return { tiktok_status: snapshot.status }
}

const FAIL_REASONS: Record<string, string> = {
  file_format_check_failed: 'TikTok could not read that file format.',
  duration_check_failed: 'Video length is outside what TikTok allows.',
  frame_rate_check_failed: 'Video frame rate is not supported by TikTok.',
  picture_size_check_failed: 'Image size is not supported by TikTok.',
  spam_risk_too_many_posts: 'TikTok daily post limit reached. Try again tomorrow.',
  spam_risk_user_banned_from_posting: 'This TikTok account is currently blocked from posting.',
  url_ownership_unverified: 'TikTok could not verify the media URL (domain verification).',
  privacy_level_option_mismatch: 'That privacy option is not available for this TikTok account.',
  auth_removed: 'TikTok access was removed - reconnect TikTok in Connections.',
}

export function tiktokFailReasonMessage(reason: string | null): string {
  if (!reason) return 'TikTok rejected the post.'
  return FAIL_REASONS[reason] ?? `TikTok rejected the post (${reason}).`
}
