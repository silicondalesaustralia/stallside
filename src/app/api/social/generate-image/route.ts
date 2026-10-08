import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import {
  type OrshotTestPlatform,
  renderOrshotStudioTemplate,
} from '@/lib/social/orshotRender'
import { parseSocialTextStyles, resolveSocialTextStyles, type PartialSocialTextStyles } from '@/lib/social/socialTextStyle'
import {
  hasRequiredFieldValues,
  parseTemplateFields,
  resolveTemplateFieldValues,
} from '@/lib/social/templateFields'
import { signJobPhotoUrl } from '@/lib/storage/jobPhotos'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'

export const runtime = 'nodejs'

const VALID_PLATFORMS = new Set<OrshotTestPlatform>(['instagram', 'facebook', 'google'])
const VALID_POST_TYPES = new Set(['job_complete', 'review', 'promo', 'custom'])

export async function POST(req: NextRequest) {
  const apiKey = process.env.ORSHOT_API_KEY?.trim()
  if (!apiKey) {
    console.error('[GenerateImage] ORSHOT_API_KEY not set')
    return NextResponse.json(
      { error: 'Image generation is not configured (ORSHOT_API_KEY missing)' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    styleTemplateId?: string
    platform?:       string
    postType?:       string
    jobId?:          string
    fieldValues?:    Record<string, string>
    textStyles?:     PartialSocialTextStyles
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const styleTemplateId = body.styleTemplateId?.trim()
  if (!styleTemplateId) {
    return NextResponse.json({ error: 'styleTemplateId is required' }, { status: 400 })
  }

  const platformRaw = body.platform?.trim() as OrshotTestPlatform | undefined
  const platform: OrshotTestPlatform =
    platformRaw && VALID_PLATFORMS.has(platformRaw) ? platformRaw : 'instagram'

  const postType = body.postType?.trim() || 'custom'
  if (!VALID_POST_TYPES.has(postType)) {
    return NextResponse.json({ error: 'Invalid postType' }, { status: 400 })
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

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  const { data: styleTemplate, error: styleTplErr } = await db
    .from('social_style_templates')
    .select('id, name, orshot_template_id, orshot_page, trade_category, fields')
    .eq('id', styleTemplateId)
    .eq('is_active', true)
    .single()

  if (styleTplErr || !styleTemplate) {
    console.error('[GenerateImage] Style template not found', {
      styleTemplateId,
      message: styleTplErr?.message,
    })
    return NextResponse.json({ error: 'Style template not found' }, { status: 404 })
  }

  const templateFields = parseTemplateFields(styleTemplate.fields)
  const orshotPage = styleTemplate.orshot_page != null
    ? Number(styleTemplate.orshot_page)
    : null
  const orshotTemplateId = Number(styleTemplate.orshot_template_id)

  if (!Number.isFinite(orshotTemplateId)) {
    return NextResponse.json({ error: 'Invalid orshot_template_id on style template' }, { status: 500 })
  }

  const { data: business } = await db
    .from('businesses')
    .select(`
      name,
      phone,
      website,
      logo_url,
      instagram_username,
      facebook_page_name,
      ai_agent_services,
      social_default_cta,
      social_text_styles
    `)
    .eq('id', businessId)
    .single()

  let jobId: string | null = body.jobId?.trim() || null
  let job: { title: string; site_suburb: string | null } | null = null

  if (jobId) {
    const { data: jobRow } = await db
      .from('jobs')
      .select('id, title, site_suburb, site_state')
      .eq('id', jobId)
      .eq('business_id', businessId)
      .maybeSingle()

    if (!jobRow) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    job = jobRow
  }

  const sourceCtx = {
    business: business ?? {},
    job,
    servicesFallback: business?.ai_agent_services,
  }

  let fieldValues = resolveTemplateFieldValues(
    templateFields,
    sourceCtx,
    body.fieldValues,
  )

  // Legacy fallback: first job photo for the default "photo" field when unset.
  const hasPhotoField = templateFields.some((f) => f.type === 'photo' && f.key === 'photo')
  if (jobId && hasPhotoField && !fieldValues.photo?.trim()) {
    const { data: photos } = await db
      .from('job_photos')
      .select('url, webp_url')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)

    const first = photos?.[0]
    const photoUrl = (first?.webp_url || first?.url || '').trim()
    if (photoUrl) {
      const signed = await signJobPhotoUrl(db, photoUrl)
      if (signed) fieldValues = { ...fieldValues, photo: signed }
    }
  }

  console.log('[GenerateImage] Resolved field values', {
    keys: Object.keys(fieldValues),
    jobId,
  })

  if (!hasRequiredFieldValues(templateFields, fieldValues)) {
    return NextResponse.json({ error: 'Required template fields are missing' }, { status: 400 })
  }

  const logoUrl = (business as { logo_url?: string | null })?.logo_url?.trim()?.slice(0, 500) || ''

  console.log('[GenerateImage] Rendering', {
    businessId,
    styleTemplateId,
    orshotTemplateId,
    orshotPage,
    platform,
    postType,
    jobId,
    fieldKeys: templateFields.map((f) => f.key),
  })

  const textStylesResolved = resolveSocialTextStyles({
    override: body.textStyles,
    business: parseSocialTextStyles(
      (business as { social_text_styles?: unknown })?.social_text_styles,
    ),
  })

  try {
    const result = await renderOrshotStudioTemplate(apiKey, {
      style:       orshotPage ?? 1,
      orshotPage,
      templateId:  orshotTemplateId,
      platform,
      fields:      templateFields,
      fieldValues,
      logoUrl:     logoUrl || undefined,
      textStyles:  textStylesResolved,
    })

    const { data: creditRow, error: creditErr } = await db
      .from('social_credit_events')
      .insert({
        business_id:        businessId,
        event_type:         'image_generated',
        template_style:     orshotPage,
        post_type:          postType,
        platform,
        job_id:             jobId,
        orshot_template_id: String(styleTemplate.orshot_template_id),
        orshot_render_url:  result.imageUrl,
        credits_used:       1,
        cost_usd:           0.01,
        is_test:            false,
      })
      .select('id')
      .single()

    if (creditErr) {
      console.error('[GenerateImage] Credit log failed (non-fatal)', creditErr.message)
    }

    return NextResponse.json({
      imageUrl:     result.imageUrl,
      renderId:     creditRow?.id ?? null,
      responseTime: result.responseTime,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GenerateImage] Render failed', { message })
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
