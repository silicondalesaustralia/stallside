import { findSocialBusinessId } from '@/lib/socialHost/findSocialBusinessId'
import { socialDb } from '@/lib/socialHost/socialDb'
import type { SocialPostRow } from '@/lib/social/socialPostTypes'

const POST_SELECT = 'id, status, publishing_mode, caption, platforms, photo_urls, scheduled_for, posted_at, created_at'

export type StandSocialPost = Pick<
  SocialPostRow,
  'id' | 'status' | 'publishing_mode' | 'caption' | 'platforms' | 'photo_urls' | 'scheduled_for' | 'posted_at'
> & { created_at: string }

export type StandSocialPosts = {
  /** False when the owner has never opened Social for this business. */
  started: boolean
  scheduled: StandSocialPost[]
  drafts: StandSocialPost[]
  /** Posted and failed, newest first. */
  history: StandSocialPost[]
}

async function select(businessId: string, statuses: string[], order: string, ascending: boolean, limit: number) {
  const { data, error } = await socialDb()
    .from('social_posts')
    .select(POST_SELECT)
    .eq('business_id', businessId)
    .in('status', statuses)
    .order(order, { ascending, nullsFirst: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as StandSocialPost[]
}

/** A business's upcoming, draft and recent social posts. Read-only. */
export async function loadStandSocialPosts(standId: string, limit = 30): Promise<StandSocialPosts> {
  const businessId = await findSocialBusinessId(standId)
  if (!businessId) return { started: false, scheduled: [], drafts: [], history: [] }
  const [scheduled, drafts, history] = await Promise.all([
    select(businessId, ['scheduled'], 'scheduled_for', true, limit),
    select(businessId, ['draft'], 'created_at', false, limit),
    select(businessId, ['posted', 'failed'], 'created_at', false, limit),
  ])
  return { started: true, scheduled, drafts, history }
}
