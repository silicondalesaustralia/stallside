// KIT SHIM - StitchedUp subscription/product gating replaced by hostCanUseSocial().
import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { hostCanUseSocial } from '@/lib/socialHost/hostAccess'
import { externalAccountIdFor } from '@/lib/socialHost/provisionSocialIdentity'

function capabilityRequired(): NextResponse {
  return NextResponse.json(
    { error: 'Your plan does not include social posting.', code: 'capability_required', capability: 'social' },
    { status: 403 },
  )
}

export async function assertSocialAccess(
  businessId: string,
  _sessionUserId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const accountId = await externalAccountIdFor(businessId)
  if (accountId && (await hostCanUseSocial(accountId))) return { ok: true }
  return { ok: false, response: capabilityRequired() }
}

export async function requirePaidBusinessAccess(): Promise<
  Awaited<ReturnType<typeof requireEffectiveBusinessContext>>
> {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx
  const access = await assertSocialAccess(ctx.businessId, ctx.user.id)
  if (!access.ok) return access
  return ctx
}
