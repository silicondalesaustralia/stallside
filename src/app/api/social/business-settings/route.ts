import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'

/** Columns the social UI may write from the browser (see lib/supabase/client.ts). */
const ALLOWED = new Set([
  'social_logo_corner',
  'social_text_styles',
  'social_brand_voice',
  'social_default_cta',
  'social_auto_prompt',
  'social_compose_last_category',
  'social_compose_last_subtype',
])

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected an object' }, { status: 400 })
  }

  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED.has(key)))
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No allowed fields' }, { status: 400 })
  }

  const { error } = await ctx.db.from('businesses').update(patch).eq('id', ctx.businessId)
  if (error) {
    console.error('[social/business-settings] update failed:', error.message)
    return NextResponse.json({ error: 'Could not save settings' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
