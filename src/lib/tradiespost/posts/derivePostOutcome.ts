import type { SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'
import type { TradiesPostStatus } from '@/lib/tradiespost/status'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'

export type PlatformOutcome = 'success' | 'failed' | 'pending'

export type PostOverallStatus =
  | 'posted'
  | 'scheduled'
  | 'needs_attention'
  | 'failed'
  | 'draft'
  | 'cancelled'

export type PostsFilter = 'all' | 'scheduled' | 'posted' | 'needs_attention'

const KNOWN_PLATFORMS: SocialPublishPlatform[] = ['facebook', 'instagram', 'gmb', 'tiktok']

function isKnownPlatform(p: string): p is SocialPublishPlatform {
  return (KNOWN_PLATFORMS as string[]).includes(p)
}

export function platformOutcome(
  post: SocialWorkspacePost,
  platform: SocialPublishPlatform,
): PlatformOutcome {
  if (post.posted_manually) return 'success'
  if (post[`${platform}_post_id`]) return 'success'
  if (post[`${platform}_error`]) return 'failed'
  return 'pending'
}

export function platformOutcomes(
  post: SocialWorkspacePost,
): { platform: SocialPublishPlatform; outcome: PlatformOutcome; error: string | null }[] {
  return post.platforms.filter(isKnownPlatform).map((platform) => ({
    platform,
    outcome: platformOutcome(post, platform),
    error: post[`${platform}_error`] ?? null,
  }))
}

export function overallStatus(post: SocialWorkspacePost): PostOverallStatus {
  if (post.status === 'cancelled') return 'cancelled'
  if (post.status === 'scheduled') return 'scheduled'
  if (post.status === 'draft') return 'draft'
  const outcomes = platformOutcomes(post).map((o) => o.outcome)
  const anyFailed = outcomes.includes('failed')
  const anySuccess = outcomes.includes('success')
  if (post.status === 'posted') return anyFailed ? 'needs_attention' : 'posted'
  return anySuccess ? 'needs_attention' : 'failed'
}

export const OVERALL_BADGE: Record<PostOverallStatus, { status: TradiesPostStatus; label: string }> = {
  posted: { status: 'published', label: 'Posted' },
  scheduled: { status: 'scheduled', label: 'Scheduled' },
  needs_attention: { status: 'needs_review', label: 'Needs attention' },
  failed: { status: 'failed', label: 'Failed' },
  draft: { status: 'draft', label: 'Draft' },
  cancelled: { status: 'draft', label: 'Cancelled' },
}

export function matchesFilter(post: SocialWorkspacePost, filter: PostsFilter): boolean {
  if (filter === 'all') return true
  const status = overallStatus(post)
  if (filter === 'needs_attention') return status === 'needs_attention' || status === 'failed'
  return status === filter
}

export function postSortTime(post: SocialWorkspacePost): number {
  return new Date(post.posted_at || post.scheduled_for || post.created_at).getTime()
}

export function postImageUrl(post: SocialWorkspacePost): string | null {
  const processed = post.processed_photo_urls
  const fromProcessed = processed
    ? Object.values(processed).find((urls) => Array.isArray(urls) && urls.length > 0)?.[0]
    : undefined
  return fromProcessed || post.photo_urls?.[0] || null
}
