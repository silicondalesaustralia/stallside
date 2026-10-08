import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { renderOrshotStudioTemplate } from '@/lib/social/orshotRender'
import { parseTemplateFields, samplePreviewFieldValues } from '@/lib/social/templateFields'

export const runtime = 'nodejs'
export const maxDuration = 60

async function handleStylePreviews(req: NextRequest) {
  const apiKey = process.env.ORSHOT_API_KEY?.trim()
  if (!apiKey) {
    console.error('[StylePreviews] ORSHOT_API_KEY not set')
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

  const templateId = req.nextUrl.searchParams.get('templateId')?.trim()
  const regenerate = req.nextUrl.searchParams.get('regenerate') === '1'

  if (!templateId) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
  }

  const { data: template, error: tplErr } = await db
    .from('social_style_templates')
    .select('id, name, orshot_template_id, orshot_page, thumbnail_url, fields')
    .eq('id', templateId)
    .eq('is_active', true)
    .single()

  if (tplErr || !template) {
    console.error('[StylePreviews] Template not found', { templateId, message: tplErr?.message })
    return NextResponse.json({ error: 'Style template not found' }, { status: 404 })
  }

  const cachedUrl = template.thumbnail_url?.trim()
  if (cachedUrl && !regenerate) {
    return NextResponse.json({
      previews: [{ templateId: template.id, previewUrl: cachedUrl }],
      cached:   true,
    })
  }

  const orshotPage = template.orshot_page != null ? Number(template.orshot_page) : null
  const orshotTemplateId = Number(template.orshot_template_id)

  const templateFields = parseTemplateFields(template.fields)
  const fieldValues = samplePreviewFieldValues(templateFields)

  try {
    console.log('[StylePreviews] Orshot render start', {
      templateId: template.id,
      orshotTemplateId,
      orshotPage,
      fieldKeys: templateFields.map((f) => f.key),
    })

    const result = await renderOrshotStudioTemplate(apiKey, {
      style:       orshotPage ?? 1,
      orshotPage,
      templateId:  orshotTemplateId,
      platform:    'instagram',
      fields:      templateFields,
      fieldValues,
    })

    const { error: updateErr } = await db
      .from('social_style_templates')
      .update({ thumbnail_url: result.imageUrl })
      .eq('id', template.id)

    if (updateErr) {
      console.error('[StylePreviews] thumbnail_url update failed', updateErr.message)
    }

    return NextResponse.json({
      previews:       [{ templateId: template.id, previewUrl: result.imageUrl }],
      generatedCount: 1,
      cached:         false,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[StylePreviews] Render failed', { templateId: template.id, message })
    return NextResponse.json(
      { error: message, errors: [{ templateId: template.id, stage: 'orshot_render', message }] },
      { status: 502 },
    )
  }
}

export async function GET(req: NextRequest) {
  return handleStylePreviews(req)
}

export async function POST(req: NextRequest) {
  return handleStylePreviews(req)
}
