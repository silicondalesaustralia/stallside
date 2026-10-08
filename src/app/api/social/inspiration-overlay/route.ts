/**
 * POST /api/social/inspiration-overlay
 * Retune overlay (copy / logo / fonts) on an existing Recreate photo. No credits.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { parseInspirationRenderFields } from '@/lib/social/inspirationRenderFields'
import { runHybridSocialRender, SHARP_UNAVAILABLE_MSG } from '@/lib/social/runHybridSocialRender'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseInspirationRenderFields(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { fields } = parsed

  if (fields.photoSource !== 'none' && !fields.photoUrl) {
    return NextResponse.json(
      { error: 'photoUrl is required to retune overlay without regenerating the photo' },
      { status: 400 },
    )
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

  const result = await runHybridSocialRender(db, {
    businessId,
    format: fields.format,
    platform: fields.platform,
    photoSource: fields.photoSource,
    photoUrl: fields.photoUrl,
    preset: fields.preset,
    content: fields.content,
    logoCorner: fields.logoCorner,
    textStyles: fields.textStyles,
    showLogo: fields.showLogo,
    chargeCredits: false,
    persistHybridRow: false,
    storagePath: `${businessId}/inspiration-preview/overlay-${crypto.randomUUID()}.webp`,
  })

  if (!result.ok) {
    const status = result.error === SHARP_UNAVAILABLE_MSG ? 503 : 502
    return NextResponse.json({ error: result.error || 'Overlay refresh failed' }, { status })
  }

  return NextResponse.json({
    ok: true,
    imageUrl: result.imageUrl,
    creditsCharged: 0,
  })
}
