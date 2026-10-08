// KIT SHIM - connect/disconnect requires a host owner/admin (hostCanManageSocial).
import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { hostCanManageSocial } from '@/lib/socialHost/hostAccess'
import { getSocialIdentity } from '@/lib/socialHost/provisionSocialIdentity'

export async function requireSocialConnectionManage() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx
  const identity = await getSocialIdentity()
  if (!hostCanManageSocial(identity?.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Only the owner or admin can connect or disconnect social accounts.' },
        { status: 403 },
      ),
    }
  }
  return ctx
}
