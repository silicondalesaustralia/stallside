/**
 * POST /api/social/inspiration-analyze/upload-url
 * Issues a one-time signed upload URL so the screenshot never
 * transits the analyze API as a JSON/base64 body.
 *
 * Body: { mimeType: string, size: number }
 * Returns: { ok, bucket, path, token, signedUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import {
  INSPIRATION_MAX_BYTES,
  INSPIRATION_TEMP_BUCKET,
  buildInspirationTempPath,
  ensureInspirationTempBucket,
  isAllowedInspirationMime,
} from '@/lib/social/inspirationTempStorage'

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

  let body: { mimeType?: string; size?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const mimeType = body.mimeType?.trim() || ''
  const size = typeof body.size === 'number' ? body.size : Number(body.size)

  if (!isAllowedInspirationMime(mimeType)) {
    return NextResponse.json(
      { error: 'Upload an image file (PNG, JPG, or WebP)' },
      { status: 400 },
    )
  }
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: 'Invalid file size' }, { status: 400 })
  }
  if (size > INSPIRATION_MAX_BYTES) {
    return NextResponse.json({ error: 'Image too large (max 4 MB)' }, { status: 400 })
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

  const path = buildInspirationTempPath(businessId, mimeType)
  if (!path) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
  }

  try {
    await ensureInspirationTempBucket(db)
  } catch (err) {
    console.error('[Inspiration] ensure bucket failed', err)
    return NextResponse.json({ error: 'Could not prepare upload' }, { status: 500 })
  }

  const { data, error } = await db.storage
    .from(INSPIRATION_TEMP_BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data?.signedUrl || !data.token) {
    console.error('[Inspiration] signed upload url failed', error)
    return NextResponse.json({ error: 'Could not prepare upload' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    bucket: INSPIRATION_TEMP_BUCKET,
    path: data.path || path,
    token: data.token,
    signedUrl: data.signedUrl,
  })
}
