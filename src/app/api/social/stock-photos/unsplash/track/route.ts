import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/** Fire-and-forget Unsplash download tracking (API guideline when a photo is used). */
export async function POST(req: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim()
  if (!accessKey) {
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { photoId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const photoId = body.photoId?.trim()
  if (!photoId) {
    return NextResponse.json({ error: 'photoId is required' }, { status: 400 })
  }

  fetch(`https://api.unsplash.com/photos/${encodeURIComponent(photoId)}/download`, {
    method:  'GET',
    headers: { Authorization: `Client-ID ${accessKey}` },
  }).catch((err) => {
    console.warn('[StockPhotos/Unsplash/track]', photoId, err)
  })

  return NextResponse.json({ ok: true })
}
