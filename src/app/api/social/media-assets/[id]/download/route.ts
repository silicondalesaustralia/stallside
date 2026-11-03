/**
 * GET /api/social/media-assets/[id]/download?variant=original|branded&filename=...
 * Redirects to a short-lived R2 link that downloads as a file (R2-stored videos only).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { isLibraryR2Path } from '@/lib/social/libraryVideoR2'
import { presignR2Url } from '@/lib/social/videoClips/r2'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

const DOWNLOAD_URL_TTL_SECONDS = 15 * 60

function safeFilename(raw: string | null): string {
  const cleaned = (raw ?? '').replace(/[^\w.\- ]+/g, '').trim().slice(0, 120)
  return /\.(mp4|mov)$/i.test(cleaned) ? cleaned : 'video.mp4'
}

export async function GET(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  const { id } = await context.params
  const variant = req.nextUrl.searchParams.get('variant') === 'branded' ? 'branded' : 'original'

  const { data: asset, error } = await ctx.db
    .from('social_media_assets')
    .select('id, storage_path, processed_storage_path')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .maybeSingle()

  if (error) {
    console.error('[MediaAssets] download fetch failed', error.message)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }

  const key = variant === 'branded' ? asset?.processed_storage_path : asset?.storage_path
  if (!asset || !isLibraryR2Path(key)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const filename = safeFilename(req.nextUrl.searchParams.get('filename'))
    const url = presignR2Url('GET', key, DOWNLOAD_URL_TTL_SECONDS, {
      'response-content-disposition': `attachment; filename="${filename}"`,
    })
    return NextResponse.redirect(url, 302)
  } catch (err) {
    console.error('[MediaAssets] download presign failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
