import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { publishPost } from '@/lib/socialPlatforms'
import {
  tiktokPostSourceFromRow,
  tiktokResultColumns,
} from '@/lib/social/tiktok/publishTikTokForPost'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  // Load the post
  const { data: post, error: postErr } = await db
    .from('social_posts')
    .select('*')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (postErr || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (!post.caption) return NextResponse.json({ error: 'Caption required' }, { status: 400 })
  const isVideo = post.media_type === 'video' && Boolean(post.video_url)
  if (!isVideo && !post.photo_urls?.length && !post.processed_photo_urls) {
    return NextResponse.json({ error: 'Photos required' }, { status: 400 })
  }

  // Load business credentials
  const { data: business } = await db
    .from('businesses')
    .select([
      'facebook_page_id', 'facebook_access_token',
      'instagram_account_id',
      'gmb_account_id', 'gmb_location_id', 'gmb_access_token',
      'linkedin_page_id', 'linkedin_access_token',
      'phone',
    ].join(', '))
    .eq('id', businessId)
    .single()

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const processedPhotoUrls: Record<string, string[]> = post.processed_photo_urls
    ? (post.processed_photo_urls as Record<string, string[]>)
    : { instagram_square: post.photo_urls || [] }

  // Publish to all selected platforms
  const results = await publishPost({
    platforms:          post.platforms,
    caption:            post.caption,
    platformCaptions:   post.platform_captions,
    processedPhotoUrls,
    businessId,
    business:           business as Parameters<typeof publishPost>[0]['business'],
    tiktokPost:         tiktokPostSourceFromRow(post),
  })

  // Determine overall status
  const anySuccess = Object.values(results).some((r) => r?.success)
  const allFailed = Object.values(results).every((r) => r && !r.success)
  const newStatus = allFailed ? 'failed' : 'posted'

  // Build update payload
  const update: Record<string, unknown> = {
    status: newStatus,
    posted_at: anySuccess ? new Date().toISOString() : null,
    facebook_post_id: results.facebook?.postId || null,
    facebook_error: results.facebook?.error || null,
    instagram_post_id: results.instagram?.postId || null,
    instagram_error: results.instagram?.error || null,
    gmb_post_id: results.gmb?.postId || null,
    gmb_error: results.gmb?.error || null,
    linkedin_post_id: results.linkedin?.postId || null,
    linkedin_error: results.linkedin?.error || null,
    ...tiktokResultColumns(results.tiktok),
  }

  await db.from('social_posts').update(update).eq('id', id)

  // Send notification
  const platformNames = post.platforms.join(', ')
  const notifMessage = anySuccess
    ? `✅ Post published to ${platformNames}`
    : `❌ Post failed to publish - tap to retry`

  await db.from('notifications').insert({
    business_id: businessId,
    type: 'social_post_published',
    message: notifMessage,
    read: false,
  })

  return NextResponse.json({ ok: true, status: newStatus, results })
}
