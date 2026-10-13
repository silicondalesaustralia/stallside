import type { SupabaseClient } from '@supabase/supabase-js'
import { graphGet } from '@/lib/social/metaGraphClient'
import { getGmbAccessToken } from '@/lib/social/gmbAuth'
import { directPostUrl, isDemoPostId } from '@/lib/social/postLinks'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'

type BusinessLinkRow = {
  facebook_access_token: string | null
  instagram_username: string | null
}

async function instagramPermalink(db: SupabaseClient, businessId: string, mediaId: string): Promise<string | null> {
  const { data, error } = await db
    .from('businesses')
    .select('facebook_access_token, instagram_username')
    .eq('id', businessId)
    .single()
  if (error || !data) throw new Error(`Business lookup failed: ${error?.message ?? 'not found'}`)
  const business = data as BusinessLinkRow
  const profile = business.instagram_username ? `https://www.instagram.com/${business.instagram_username}/` : null
  if (!business.facebook_access_token) return profile
  try {
    const media = await graphGet<{ permalink?: string }>(mediaId, {
      fields: 'permalink',
      access_token: business.facebook_access_token,
    })
    return media.permalink ?? profile
  } catch (err) {
    console.error('[Post link] Instagram permalink lookup failed', err)
    return profile
  }
}

async function googlePostUrl(businessId: string, localPostName: string): Promise<string | null> {
  const token = await getGmbAccessToken(businessId)
  if (!token) return null
  const res = await fetch(`https://mybusiness.googleapis.com/v4/${localPostName}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    console.error('[Post link] Google post lookup failed', { status: res.status })
    return null
  }
  const json = (await res.json()) as { searchUrl?: string }
  return json.searchUrl ?? null
}

/** Live URL for one platform's copy of a post, or null when there is nothing to open. */
export async function resolvePostPermalink(params: {
  db: SupabaseClient
  businessId: string
  platform: SocialPublishPlatform
  postId: string
}): Promise<string | null> {
  const { db, businessId, platform, postId } = params
  if (isDemoPostId(postId)) return null
  if (platform === 'instagram') return instagramPermalink(db, businessId, postId)
  if (platform === 'gmb') return googlePostUrl(businessId, postId)
  return directPostUrl(platform, postId)
}
