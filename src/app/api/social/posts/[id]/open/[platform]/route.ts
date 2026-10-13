import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import {
  COMPOSER_PUBLISH_PLATFORMS,
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { resolvePostPermalink } from '@/lib/social/resolvePostPermalink'

function isPlatform(value: string): value is SocialPublishPlatform {
  return (COMPOSER_PUBLISH_PLATFORMS as string[]).includes(value)
}

function notAvailable(message: string, status = 404) {
  return new NextResponse(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

/** Posts page "View on …": resolve the live post URL for one platform and redirect to it. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; platform: string }> },
) {
  const { id, platform } = await params
  if (!isPlatform(platform)) return notAvailable('Unknown platform', 400)
  const label = SOCIAL_PUBLISH_PLATFORM_LABELS[platform]

  try {
    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const column = `${platform}_post_id`
    const { data, error } = await db
      .from('social_posts')
      .select(column)
      .eq('id', id)
      .eq('business_id', businessId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    const postId = (data as Record<string, unknown> | null)?.[column]
    if (typeof postId !== 'string' || !postId) return notAvailable(`This post isn't live on ${label} yet.`)

    const url = await resolvePostPermalink({ db, businessId, platform, postId })
    if (!url) return notAvailable(`Couldn't find a link to this post on ${label}.`)
    return NextResponse.redirect(url)
  } catch (err) {
    console.error('[Post link]', { id, platform, err })
    return notAvailable(`Couldn't open this post on ${label}. Try again shortly.`, 502)
  }
}
