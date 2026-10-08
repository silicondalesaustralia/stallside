// KIT SHIM - StitchedUp admin impersonation is not part of the kit.
// requireEffectiveBusinessContext keeps its exact return shape so the 47
// routes that call it work unchanged; it now resolves the host session.
import { NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getSocialIdentity } from '@/lib/socialHost/provisionSocialIdentity'
import { socialDb } from '@/lib/socialHost/socialDb'

const EMPTY_CONTEXT = {
  impersonatingId: null as string | null,
  impersonatingName: null as string | null,
  isImpersonating: false,
  logId: null as string | null,
}

export async function getImpersonationContext(): Promise<typeof EMPTY_CONTEXT> {
  return EMPTY_CONTEXT
}

export async function resolveEffectiveBusinessId(
  userBusinessId: string | null | undefined,
): Promise<string | null> {
  if (userBusinessId) return userBusinessId
  const identity = await getSocialIdentity()
  return identity?.businessId ?? null
}

export async function requireEffectiveBusinessContext(): Promise<
  | { ok: true; user: User; userBusinessId: string | null; businessId: string; db: SupabaseClient }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const identity = await getSocialIdentity()
  if (!user || !identity) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return {
    ok: true,
    user,
    userBusinessId: identity.businessId,
    businessId: identity.businessId,
    db: socialDb(),
  }
}
