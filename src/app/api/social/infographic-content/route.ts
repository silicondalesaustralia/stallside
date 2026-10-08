/**
 * POST /api/social/infographic-content
 * Phase C - gpt-4o-mini structured infographic copy (no image render / no credits).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import {
  COMPOSE_PLATFORMS,
  isInfographicPreset,
  type ComposePlatform,
  type InfographicPreset,
} from '@/lib/social/composeModel'
import { generateInfographicContent } from '@/lib/social/infographicContent'
import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'
import {
  DEFAULT_POST_SUBTYPE_ID,
  isPostSubtypeId,
} from '@/lib/social/postTaxonomy'

export const runtime = 'nodejs'
export const maxDuration = 30

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
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 503 },
    )
  }

  let body: {
    preset?: string
    platform?: string
    postSubtype?: string
    jobId?: string
    generationHints?: InspirationGenerationHints
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const presetRaw = body.preset?.trim() ?? ''
  if (!isInfographicPreset(presetRaw)) {
    return NextResponse.json({ error: 'Invalid preset' }, { status: 400 })
  }
  const preset = presetRaw as InfographicPreset

  const platformRaw = (body.platform?.trim() || 'instagram') as ComposePlatform
  if (!COMPOSE_PLATFORMS.includes(platformRaw)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }
  const platform = platformRaw

  const subtypeRaw = (body.postSubtype?.trim() || DEFAULT_POST_SUBTYPE_ID) as string
  if (!isPostSubtypeId(subtypeRaw)) {
    return NextResponse.json({ error: 'Invalid postSubtype' }, { status: 400 })
  }
  const postSubtype = subtypeRaw

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

  const { data: business, error: bizErr } = await db
    .from('businesses')
    .select('name, ai_agent_services, social_default_cta')
    .eq('id', businessId)
    .maybeSingle()

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  let job: {
    title?: string | null
    description?: string | null
    site_suburb?: string | null
    site_state?: string | null
  } | null = null

  const jobId = body.jobId?.trim()
  if (jobId) {
    const { data: jobRow, error: jobErr } = await db
      .from('jobs')
      .select('title, description, site_suburb, site_state')
      .eq('id', jobId)
      .eq('business_id', businessId)
      .maybeSingle()
    if (jobErr) {
      console.warn('[InfographicContent] job lookup', jobErr.message)
    }
    if (jobRow) job = jobRow
  }

  try {
    const generationHints = body.generationHints ?? null

    const result = await generateInfographicContent({
      preset,
      platform,
      postSubtype,
      business: {
        name: business.name,
        ai_agent_services: business.ai_agent_services,
        social_default_cta: business.social_default_cta,
      },
      job,
      generationHints,
    })

    console.log('[InfographicContent] ok', {
      businessId,
      preset: result.preset,
      platform: result.platform,
      postSubtype,
      tradeId: result.tradeId,
      retried: result.retried,
      model: result.model,
    })

    return NextResponse.json({
      preset: result.preset,
      platform: result.platform,
      postSubtype,
      tradeId: result.tradeId,
      tradeLabel: result.tradeLabel,
      servicesSnippet: result.servicesSnippet,
      content: result.content,
      model: result.model,
      retried: result.retried,
    })
  } catch (err) {
    console.error('[InfographicContent] FAILED', err)
    return NextResponse.json(
      {
        error: 'Failed to generate infographic content',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    )
  }
}
