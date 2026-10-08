/**
 * POST /api/social/inspiration-photo-refine
 * Regenerates only the AI photo for a Recreate variant (1 credit). Overlay copy stays.
 */

import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { parseInspirationRenderFields } from '@/lib/social/inspirationRenderFields'
import { evaluateRenderEligibility } from '@/lib/renders/consumeRenderCredit'
import { evaluateUsageAccess, paymentRequiredPayload } from '@/lib/billing/usageAccounting'
import { isUsageWalletEnabled } from '@/lib/billing/usageWalletEnabled'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { runHybridSocialRender, SHARP_UNAVAILABLE_MSG } from '@/lib/social/runHybridSocialRender'
import { MAX_AI_IMAGE_EXTRA_DETAIL } from '@/lib/social/aiImageStyles'

export const runtime = 'nodejs'
export const maxDuration = 120

const NO_CREDITS_MSG =
  'No render credits remaining. Buy a credit pack to continue, or your free trial has already been used.'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const refinePrompt =
    typeof body.refinePrompt === 'string' ? body.refinePrompt.trim() : ''
  if (!refinePrompt) {
    return NextResponse.json({ error: 'Describe the photo change' }, { status: 400 })
  }

  const parsed = parseInspirationRenderFields({
    ...body,
    photoUrl: null,
    photoSource: 'ai_generate',
  })
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { fields } = parsed

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

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  const { data: balanceRow } = await db
    .from('render_credits')
    .select('credits_remaining, free_trial_used')
    .eq('business_id', businessId)
    .maybeSingle()

  const eligibility = evaluateRenderEligibility(
    balanceRow
      ? {
          creditsRemaining: balanceRow.credits_remaining,
          freeTrialUsed: balanceRow.free_trial_used,
        }
      : null,
  )
  if (isUsageWalletEnabled()) {
    const access = await evaluateUsageAccess(db, businessId)
    if (!access.allowed) {
      const denied = paymentRequiredPayload(access)
      return NextResponse.json(denied.body, { status: denied.status })
    }
  } else if (!eligibility.allowed) {
    return NextResponse.json(
      { error: NO_CREDITS_MSG, code: 'no_render_credits' },
      { status: 402 },
    )
  }

  const { data: scenes } = await db
    .from('ai_image_scene_options')
    .select('id, purpose')
    .eq('purpose', 'job_showcase')
    .order('sort_order', { ascending: true })
    .limit(1)

  const sceneId = scenes?.[0]?.id
  if (!sceneId) {
    return NextResponse.json({ error: 'No job showcase scenes configured' }, { status: 500 })
  }

  const renderId = randomUUID()
  const result = await runHybridSocialRender(db, {
    businessId,
    format: fields.format,
    platform: fields.platform,
    photoSource: 'ai_generate',
    photoUrl: null,
    preset: fields.preset,
    content: fields.content,
    logoCorner: fields.logoCorner,
    textStyles: fields.textStyles,
    showLogo: fields.showLogo,
    returnBackgroundUrl: true,
    backgroundStoragePath: `${businessId}/inspiration-preview/${renderId}-bg.webp`,
    aiBackground: {
      purpose: 'job_showcase',
      sceneId,
      style: 'photorealistic',
      extraDetail: refinePrompt.slice(0, MAX_AI_IMAGE_EXTRA_DETAIL),
      avoidPeople: true,
    },
    eligibility: eligibility.allowed ? eligibility : { allowed: true, useFreeTrial: false },
    chargeCredits: true,
    persistHybridRow: false,
    storagePath: `${businessId}/inspiration-preview/${renderId}.webp`,
    renderId,
  })

  if (!result.ok) {
    const status = result.error === SHARP_UNAVAILABLE_MSG ? 503 : 502
    return NextResponse.json({ error: result.error || 'Photo refine failed' }, { status })
  }

  return NextResponse.json({
    ok: true,
    imageUrl: result.imageUrl,
    backgroundUrl: result.backgroundUrl ?? null,
    creditsCharged: result.creditsCharged,
    usedFreeTrial: result.usedFreeTrial,
  })
}
