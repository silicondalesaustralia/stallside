/**
 * POST /api/social/inspiration-analyze/read-url
 * Returns a short-lived HTTPS signed download URL for an owned
 * inspiration-temp object. JSON only — no file bytes through Vercel.
 *
 * Body: { path: string }
 * Returns: { ok, url, path }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import {
  INSPIRATION_TEMP_BUCKET,
  isOwnedInspirationTempPath,
} from '@/lib/social/inspirationTempStorage'
import { isHttpsPhotoUrl } from '@/lib/social/resolveComposePhoto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { path?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const path = body.path?.trim() || ''
  if (!path) {
    return NextResponse.json({ error: 'Missing photo path' }, { status: 400 })
  }

  const db = await createServiceClient()
  const { data: userData } = await db
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'No business linked to user' }, { status: 400 })
  }

  if (!isOwnedInspirationTempPath(businessId, path)) {
    return NextResponse.json({ error: 'Photo is not available for this business.' }, { status: 403 })
  }

  const { data, error } = await db.storage
    .from(INSPIRATION_TEMP_BUCKET)
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl || !isHttpsPhotoUrl(data.signedUrl)) {
    console.error('[Inspiration] signed read url failed', error)
    return NextResponse.json({ error: 'Couldn’t load the uploaded photo. Please try again.' }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    path,
    url: data.signedUrl,
  })
}
