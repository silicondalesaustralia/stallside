import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { StockPhoto } from '@/lib/social/stockPhotos'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const apiKey = process.env.PEXELS_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Pexels is not configured (PEXELS_API_KEY missing)' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const query = req.nextUrl.searchParams.get('query')?.trim()
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '20')
  url.searchParams.set('orientation', 'square')

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      next:    { revalidate: 0 },
    })

    const raw = await res.json()
    if (!res.ok) {
      const msg = (raw as { error?: string })?.error ?? `Pexels search failed (${res.status})`
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const photosRaw = (raw as { photos?: unknown[] }).photos ?? []
    const photos: StockPhoto[] = photosRaw.map((item) => {
      const photo = item as {
        id:           number
        src?:         { medium?: string; large?: string; large2x?: string }
        photographer?: string
      }
      return {
        id:               String(photo.id),
        thumbnailUrl:     photo.src?.medium ?? '',
        fullUrl:          photo.src?.large2x ?? photo.src?.large ?? photo.src?.medium ?? '',
        photographerName: photo.photographer ?? 'Unknown',
        photographerUrl:  null,
        source:           'pexels' as const,
      }
    }).filter((p) => p.thumbnailUrl && p.fullUrl)

    return NextResponse.json({ photos })
  } catch (err) {
    console.error('[StockPhotos/Pexels]', err)
    return NextResponse.json({ error: 'Pexels search failed' }, { status: 502 })
  }
}
