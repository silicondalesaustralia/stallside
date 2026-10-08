/**
 * GET /api/social/media-assets
 * List ready video assets for Library (uploading/failed excluded).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { mapMediaAssetRow, type SocialMediaAssetRow } from '@/lib/social/mediaAssetTypes'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  const { data: userData } = await db
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const limitRaw = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50
  const status = req.nextUrl.searchParams.get('status')?.trim() || 'ready'

  let query = db
    .from('social_media_assets')
    .select(
      'id, business_id, job_id, media_type, status, original_url, processed_url, processed_storage_path, processing_status, branding_config, thumbnail_url, storage_path, thumbnail_path, duration_seconds, mime_type, file_size_bytes, caption, about_text, created_at, updated_at',
    )
    .eq('business_id', businessId)
    .eq('media_type', 'video')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: rows, error: listErr } = await query

  if (listErr) {
    const missing =
      listErr.code === '42P01' ||
      /does not exist|schema cache/i.test(listErr.message ?? '')
    if (missing) {
      return NextResponse.json({ assets: [] })
    }
    console.error('[MediaAssets] list failed', listErr.message)
    return NextResponse.json({ error: 'Could not load media assets' }, { status: 500 })
  }

  const baseRows = (rows as SocialMediaAssetRow[] | null) ?? []
  const jobIds = [
    ...new Set(
      baseRows
        .map((row) => row.job_id)
        .filter((id): id is string => typeof id === 'string' && !!id.trim()),
    ),
  ]

  const jobById = new Map<string, { title: string | null; site_suburb: string | null }>()
  if (jobIds.length) {
    const { data: jobRows } = await db
      .from('jobs')
      .select('id, title, site_suburb')
      .eq('business_id', businessId)
      .in('id', jobIds)
    for (const job of jobRows ?? []) {
      jobById.set(job.id, {
        title: typeof job.title === 'string' ? job.title : null,
        site_suburb: typeof job.site_suburb === 'string' ? job.site_suburb : null,
      })
    }
  }

  const assets = baseRows.map((row) =>
    mapMediaAssetRow({
      ...row,
      jobs: row.job_id ? jobById.get(row.job_id) ?? null : null,
    }),
  )
  return NextResponse.json({ assets })
}
