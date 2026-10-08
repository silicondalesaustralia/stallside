import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'

/** Session context for the social UI (connections page reads user.role/permissions). */
export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response

  const [{ data: profile, error: profileError }, { data: business, error: businessError }] = await Promise.all([
    ctx.db.from('users').select('id, email, role, full_name, permissions').eq('id', ctx.user.id).maybeSingle(),
    ctx.db.from('businesses').select('id, name, timezone').eq('id', ctx.businessId).maybeSingle(),
  ])
  if (profileError || businessError || !profile || !business) {
    console.error('[me/context] lookup failed:', profileError?.message ?? businessError?.message)
    return NextResponse.json({ error: 'Could not load profile' }, { status: 500 })
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      permissions: profile.permissions ?? null,
    },
    business: { id: business.id, name: business.name, timezone: business.timezone },
    products: [],
    capabilities: ['social'],
    isImpersonating: false,
    impersonatingName: null,
  })
}
