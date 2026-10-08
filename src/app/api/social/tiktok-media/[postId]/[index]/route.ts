import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  isProxyableStorageUrl,
  tiktokSourcePhotoUrls,
  verifyTikTokMediaSignature,
} from '@/lib/social/tiktok/tiktokMediaUrl'

export const runtime = 'nodejs'

/** TikTok photo posts accept at most 1080p images. */
const TIKTOK_PHOTO_MAX = { width: 1080, height: 1920 }

/**
 * Public (unauthenticated) photo proxy on the TikTok-verified URL prefix.
 * TikTok pulls photo posts from here; access requires an HMAC signature
 * bound to the post id + image index.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; index: string }> },
) {
  const { postId, index: indexRaw } = await params
  const index = Number.parseInt(indexRaw, 10)
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!verifyTikTokMediaSignature(postId, index, req.nextUrl.searchParams.get('sig'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const db = await createServiceClient()
    const { data: post } = await db
      .from('social_posts')
      .select('platforms, photo_urls, processed_photo_urls')
      .eq('id', postId)
      .maybeSingle()

    if (!post || !Array.isArray(post.platforms) || !post.platforms.includes('tiktok')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const processed = (post.processed_photo_urls as Record<string, string[]> | null) ?? {
      instagram_square: (post.photo_urls as string[] | null) ?? [],
    }
    const source = tiktokSourcePhotoUrls(processed)[index]
    if (!source || !isProxyableStorageUrl(source)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const upstream = await fetch(source)
    if (!upstream.ok) {
      console.error('[TikTok media] Upstream fetch failed', { postId, index, status: upstream.status })
      return NextResponse.json({ error: 'Media unavailable' }, { status: 502 })
    }
    const { default: sharp } = await import('sharp')
    const image = await sharp(Buffer.from(await upstream.arrayBuffer()))
      .rotate()
      .resize(TIKTOK_PHOTO_MAX.width, TIKTOK_PHOTO_MAX.height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
    return new NextResponse(new Uint8Array(image), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Content-Length': String(image.byteLength),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[TikTok media] Proxy failed', { postId, index, err })
    return NextResponse.json({ error: 'Media unavailable' }, { status: 500 })
  }
}
