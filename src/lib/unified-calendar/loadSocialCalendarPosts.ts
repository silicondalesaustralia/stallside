import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'
import { getHostSession } from '@/lib/socialHost/hostSession'
import { socialDb } from '@/lib/socialHost/socialDb'

const POST_SELECT =
  'id, status, publishing_mode, caption, platforms, photo_urls, scheduled_for, week_plan_item_id'

/**
 * Scheduled social posts in [start, end). Read-only: owners who never opened
 * Social have no business row yet, and the calendar must not create one.
 */
export async function loadSocialCalendarPosts(start: Date, end: Date): Promise<SocialCalendarPost[]> {
  try {
    const session = await getHostSession()
    if (!session) return []
    const db = socialDb()
    const { data: business, error: bizError } = await db
      .from('businesses')
      .select('id')
      .eq('external_account_id', session.accountId)
      .maybeSingle()
    if (bizError) throw new Error(bizError.message)
    if (!business) return []

    const { data, error } = await db
      .from('social_posts')
      .select(POST_SELECT)
      .eq('business_id', business.id as string)
      .eq('status', 'scheduled')
      .gte('scheduled_for', start.toISOString())
      .lt('scheduled_for', end.toISOString())
      .order('scheduled_for')
    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as SocialCalendarPost[]
  } catch (err) {
    console.error('[calendar] social posts load failed', err)
    return []
  }
}
