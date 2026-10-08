import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { buildServicesSnippet } from '@/lib/social/aiImagePrompt'
import { expandCustomImagePrompt } from '@/lib/social/expandCustomImagePrompt'
import { inferTradeCategory } from '@/lib/social/inferTradeCategory'
import {
  MAX_AI_IMAGE_CUSTOM_PROMPT,
  type AiImageMode,
} from '@/lib/social/aiImageStyles'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 503 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase.from('users') as any)
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  let body: {
    customPrompt?:   string
    mode?:           string
    tradeCategory?:  string
    businessName?:   string | null
    jobDescription?: string | null
    brandColor?:     string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const modeRaw = body.mode?.trim() || 'photo'
  if (modeRaw !== 'photo' && modeRaw !== 'full_post') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }
  const mode = modeRaw as AiImageMode

  const tradeCategory = body.tradeCategory?.trim()
  if (!tradeCategory) {
    return NextResponse.json({ error: 'tradeCategory is required' }, { status: 400 })
  }

  const customPromptRaw = body.customPrompt?.trim() ?? ''
  if (!customPromptRaw) {
    return NextResponse.json({ error: 'customPrompt is required' }, { status: 400 })
  }
  if (customPromptRaw.length > MAX_AI_IMAGE_CUSTOM_PROMPT) {
    return NextResponse.json(
      { error: `Custom prompt must be ${MAX_AI_IMAGE_CUSTOM_PROMPT} characters or fewer` },
      { status: 400 },
    )
  }

  const db = await createServiceClient()
  const { data: biz } = await db
    .from('businesses')
    .select('name, brand_color, ai_agent_services, social_default_cta')
    .eq('id', businessId)
    .maybeSingle()

  type BizRow = {
    name?:               string | null
    brand_color?:        string | null
    ai_agent_services?:  string | null
    social_default_cta?: string | null
  }

  const bizRow = biz as BizRow | null

  const businessName =
    body.businessName?.trim() ||
    bizRow?.name?.trim() ||
    'Your Business'

  const inferredTrade = inferTradeCategory({
    ai_agent_services: bizRow?.ai_agent_services,
    name:              bizRow?.name,
  })
  const effectiveTradeCategory = inferredTrade ?? tradeCategory

  const servicesSnippet = buildServicesSnippet({
    ai_agent_services:  bizRow?.ai_agent_services,
    social_default_cta: bizRow?.social_default_cta,
  })

  let brandColor = body.brandColor?.trim() || null
  if (!brandColor) {
    brandColor = bizRow?.brand_color?.trim() || null
  }

  const expansion = await expandCustomImagePrompt({
    rawPrompt:       customPromptRaw,
    mode,
    businessName,
    tradeCategory:   effectiveTradeCategory,
    servicesSnippet,
    jobDescription:  body.jobDescription,
    brandColor,
  })

  if (!expansion.ok) {
    console.log('[AiImage/expand-prompt] Failed', {
      businessId,
      reason: expansion.reason,
      mode,
    })
    return NextResponse.json(
      { error: 'Could not generate prompt - try again or use your text as-is.' },
      { status: 502 },
    )
  }

  return NextResponse.json({
    expandedPrompt:       expansion.expandedPrompt,
    expandedPromptLength: expansion.expandedPrompt.length,
    model:                expansion.model,
  })
}
