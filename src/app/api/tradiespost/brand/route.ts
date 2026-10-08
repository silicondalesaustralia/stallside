import { NextRequest, NextResponse } from 'next/server'
import { loadSessionBusinessUser } from '@/lib/auth/permissions'
import { pickTradiesPostBrandPatch } from '@/lib/products/tradiesPostBrand'
import { canEditTradiesPostBrand } from '@/lib/products/tradiesPostTeam'
import { getServiceDb } from '@/lib/team/requireBusinessOwner'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'

export const runtime = 'nodejs'

const BRAND_SELECT =
  'id, name, website, logo_url, brand_color, brand_text_color, ai_agent_services, address, phone'

export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response

  const profile = await loadSessionBusinessUser(ctx.db, ctx.user.id)
  const { data, error } = await ctx.db
    .from('businesses')
    .select(BRAND_SELECT)
    .eq('id', ctx.businessId)
    .single()

  if (error || !data) {
    console.error('[TP brand] load failed', error?.message)
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  return NextResponse.json({
    business: data,
    canEdit:
      profile?.role === 'super_admin' ||
      canEditTradiesPostBrand(profile?.role, profile?.permissions),
  })
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response

  const profile = await loadSessionBusinessUser(ctx.db, ctx.user.id)
  if (profile?.role !== 'super_admin' && !canEditTradiesPostBrand(profile?.role, profile?.permissions)) {
    return NextResponse.json(
      { error: 'Only the owner or admin can update brand settings.' },
      { status: 403 },
    )
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const patch = pickTradiesPostBrandPatch(body)
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No approved brand fields to update' }, { status: 400 })
  }

  const admin = await getServiceDb()
  const { data, error } = await admin
    .from('businesses')
    .update(patch)
    .eq('id', ctx.businessId)
    .select(BRAND_SELECT)
    .single()

  if (error || !data) {
    console.error('[TP brand] update failed', error?.message)
    return NextResponse.json({ error: 'Failed to save brand' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, business: data })
}
