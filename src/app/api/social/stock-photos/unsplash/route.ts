import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type StockPhoto, unsplashAttributionUrl } from '@/lib/social/stockPhotos'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim()
  if (!accessKey) {
    return NextResponse.json(
      { error: 'Unsplash is not configured (UNSPLASH_ACCESS_KEY missing)' },
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

  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '20')
  url.searchParams.set('orientation', 'squarish')

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next:    { revalidate: 0 },
    })

    const raw = await res.json()
    if (!res.ok) {
      const msg = (raw as { errors?: string[] })?.errors?.join(', ')
        ?? (raw as { error?: string })?.error
        ?? `Unsplash search failed (${res.status})`
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const results = (raw as { results?: unknown[] }).results ?? []
    const photos: StockPhoto[] = results.map((item) => {
      const photo = item as {
        id:     string
        urls?:  { small?: string; regular?: string }
        user?:  { name?: string; links?: { html?: string } }
      }
      return {
        id:               photo.id,
        thumbnailUrl:     photo.urls?.small ?? '',
        fullUrl:          photo.urls?.regular ?? photo.urls?.small ?? '',
        photographerName: photo.user?.name ?? 'Unknown',
        photographerUrl:  photo.user?.links?.html
          ? unsplashAttributionUrl(photo.user.links.html)
          : null,
        source:           'unsplash' as const,
      }
    }).filter((p) => p.thumbnailUrl && p.fullUrl)

    return NextResponse.json({ photos })
  } catch (err) {
    console.error('[StockPhotos/Unsplash]', err)
    return NextResponse.json({ error: 'Unsplash search failed' }, { status: 502 })
  }
}
