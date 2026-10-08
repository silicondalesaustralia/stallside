import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { convertToWebP } from '@/lib/imageProcessor'

export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024

const ALLOWED_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com',
  'images.pexels.com',
])

function isAllowedStockUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw)
    return parsed.protocol === 'https:' && ALLOWED_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase.from('users') as any)
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const sourceUrl = body.url?.trim()
  if (!sourceUrl) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  if (!isAllowedStockUrl(sourceUrl)) {
    return NextResponse.json({ error: 'URL must be a supported Unsplash or Pexels image' }, { status: 400 })
  }

  try {
    const imageRes = await fetch(sourceUrl, {
      headers: { Accept: 'image/*' },
      signal:  AbortSignal.timeout(30_000),
    })

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: `Failed to download image (${imageRes.status})` },
        { status: 502 },
      )
    }

    const contentType = imageRes.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Downloaded file is not an image' }, { status: 400 })
    }

    const rawBuffer = Buffer.from(await imageRes.arrayBuffer())
    if (rawBuffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 })
    }

    const webpBuffer = await convertToWebP(rawBuffer, 2048, 85)
    const path = `${businessId}/stock/${Date.now()}.webp`

    const storage = await createServiceClient()
    const { error: uploadErr } = await storage.storage
      .from('social-posts')
      .upload(path, webpBuffer, { contentType: 'image/webp', upsert: false })

    if (uploadErr) {
      console.error('[StockPhotos/rehost] Upload failed', uploadErr.message)
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = storage.storage.from('social-posts').getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[StockPhotos/rehost]', message)
    return NextResponse.json({ error: 'Failed to rehost stock photo' }, { status: 502 })
  }
}
