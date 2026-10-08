import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import {
  buildStyleTabs,
  defaultStyleTab,
  inferTradeCategory,
  type SocialStyleTemplate,
} from '@/lib/social/inferTradeCategory'
import { parseTemplateFields } from '@/lib/social/templateFields'

export const runtime = 'nodejs'

export async function GET() {
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

  const { data: business } = await db
    .from('businesses')
    .select('name, ai_agent_services')
    .eq('id', businessId)
    .single()

  const { data: rows, error: tplErr } = await db
    .from('social_style_templates')
    .select('id, name, trade_category, orshot_template_id, orshot_page, thumbnail_url, sort_order, fields')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (tplErr) {
    console.error('[StyleTemplates] Load failed - is migration 061 applied?', tplErr.message)
    return NextResponse.json(
      { error: 'Style library unavailable', detail: tplErr.message },
      { status: 503 },
    )
  }

  const templates: SocialStyleTemplate[] = (rows || []).map((row) => ({
    id:                 row.id,
    name:               row.name,
    trade_category:     row.trade_category,
    orshot_template_id: row.orshot_template_id,
    orshot_page:        row.orshot_page != null ? Number(row.orshot_page) : null,
    thumbnail_url:      row.thumbnail_url?.trim() || null,
    sort_order:         row.sort_order ?? 0,
    fields:             parseTemplateFields(row.fields),
  }))

  const businessTradeCategory = inferTradeCategory({
    ai_agent_services: business?.ai_agent_services,
    name:              business?.name,
  })

  const categories = [...new Set(templates.map((t) => t.trade_category))]
  const tabs = buildStyleTabs(categories, businessTradeCategory)
  const defaultTab = defaultStyleTab(tabs, businessTradeCategory, templates)

  return NextResponse.json({
    templates,
    tabs,
    businessTradeCategory,
    defaultTab,
  })
}
