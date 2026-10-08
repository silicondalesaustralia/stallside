import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (userErr) {
    console.error('[HybridRenders] users lookup failed', userErr.message)
    return NextResponse.json({ error: 'Could not read user record' }, { status: 500 })
  }

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const limitRaw = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50
  const status = req.nextUrl.searchParams.get('status')?.trim() || 'completed'
  const reusableOnly = req.nextUrl.searchParams.get('reusableOnly') === 'true'

  const db = await createServiceClient()

  // Over-fetch when filtering to photo_url in memory - avoids Supabase TS depth
  // blow-up from chaining multiple .not() filters on the query builder.
  const fetchLimit = reusableOnly ? Math.min(limit * 4, 100) : limit

  let query = db
    .from('hybrid_social_renders')
    .select(
      'id, preset, platform, photo_source, photo_url, content, result_url, status, created_at, job_id',
    )
    .eq('business_id', businessId)
    .not('result_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(fetchLimit)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: rows, error: listErr } = await query

  if (listErr) {
    const missing =
      listErr.code === '42P01' ||
      /does not exist|schema cache/i.test(listErr.message ?? '')
    if (missing) {
      console.warn('[HybridRenders] table missing - returning empty list')
      return NextResponse.json({ renders: [] })
    }
    console.error('[HybridRenders] List failed', listErr.message)
    return NextResponse.json({ error: 'Could not load renders' }, { status: 500 })
  }

  const renders = reusableOnly
    ? (rows ?? [])
        .filter((row) => typeof row.photo_url === 'string' && row.photo_url.trim().length > 0)
        .slice(0, limit)
    : (rows ?? [])

  return NextResponse.json({ renders })
}
