// KIT SHIM - only loadSessionBusinessUser is used by the social code.
import type { SupabaseClient } from '@supabase/supabase-js'

export type SessionBusinessUser = {
  id: string
  business_id: string | null
  role: string
  permissions: Record<string, boolean>
  email: string
  full_name: string | null
}

export async function loadSessionBusinessUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<SessionBusinessUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, business_id, role, permissions, email, full_name')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('[social kit] loadSessionBusinessUser failed:', error.message)
    return null
  }
  if (!data) return null
  return {
    id: data.id,
    business_id: data.business_id,
    role: data.role,
    permissions: (data.permissions ?? {}) as Record<string, boolean>,
    email: data.email,
    full_name: data.full_name,
  }
}
