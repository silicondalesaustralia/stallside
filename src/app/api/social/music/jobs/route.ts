import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { parseMusicChoice } from '@/lib/social/music/musicCatalog'
import { isProxyableStorageUrl } from '@/lib/social/tiktok/tiktokMediaUrl'

export const runtime = 'nodejs'

/** Create a post > Add music: queues the worker to mix a library track into the chosen video. */
export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const sourceUrl = typeof body?.sourceUrl === 'string' ? body.sourceUrl.trim() : ''
  const assetId = typeof body?.assetId === 'string' && body.assetId.trim() ? body.assetId.trim() : null
  const music = parseMusicChoice(body?.music)
  if (!sourceUrl || !isProxyableStorageUrl(sourceUrl)) {
    return NextResponse.json({ error: 'Pick a video from your Library or upload one first.' }, { status: 400 })
  }
  if (!music) return NextResponse.json({ error: 'Pick a song first.' }, { status: 400 })

  try {
    if (assetId) {
      const { data: asset, error } = await db
        .from('social_media_assets')
        .select('id')
        .eq('id', assetId)
        .eq('business_id', businessId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!asset) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    const { data: job, error } = await db
      .from('social_music_jobs')
      .insert({ business_id: businessId, source_url: sourceUrl, source_asset_id: assetId, music })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ jobId: job.id as string })
  } catch (err) {
    console.error('[Music] job create failed', { businessId, err })
    return NextResponse.json({ error: 'Could not add the music - try again.' }, { status: 500 })
  }
}
