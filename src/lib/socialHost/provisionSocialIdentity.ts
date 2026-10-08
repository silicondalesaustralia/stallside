import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getHostSession, type HostRole, type HostSession } from '@/lib/socialHost/hostSession'
import { socialDb } from '@/lib/socialHost/socialDb'
import { loadHostBusinessProfile } from '@/lib/socialHost/hostBusinessProfile'

/** The signed-in host user mapped onto social DB rows. */
export type SocialIdentity = {
  userId: string
  businessId: string
  email: string
  name: string | null
  role: HostRole
  accountId: string
}

const FULL_ACCESS = {
  can_send_quotes: true,
  can_mark_job_done: true,
  can_upload_photos: true,
  can_send_invoices: true,
  can_view_crm: true,
}

function socialRole(role: HostRole): 'owner' | 'team_member' {
  return role === 'owner' ? 'owner' : 'team_member'
}

async function ensureBusiness(db: SupabaseClient, s: HostSession): Promise<string> {
  const [{ data: existing, error }, profile] = await Promise.all([
    db
      .from('businesses')
      .select('id, name, business_type, suburb, state, phone, ai_agent_services')
      .eq('external_account_id', s.accountId)
      .maybeSingle(),
    loadHostBusinessProfile(s.accountId),
  ])
  if (error) throw new Error(`[socialHost] business lookup failed: ${error.message}`)

  const synced = {
    name: s.accountName,
    business_type: profile.businessType,
    suburb: profile.suburb,
    state: profile.state,
  }
  if (existing) {
    const changed = (Object.keys(synced) as (keyof typeof synced)[]).some((k) => existing[k] !== synced[k])
    const fillEmpty = {
      ...(!existing.phone && profile.phone ? { phone: profile.phone } : {}),
      ...(!existing.ai_agent_services ? { ai_agent_services: profile.servicesSummary } : {}),
    }
    if (changed || Object.keys(fillEmpty).length > 0) {
      const { error: updateError } = await db.from('businesses').update({ ...synced, ...fillEmpty }).eq('id', existing.id)
      if (updateError) console.error('[socialHost] business profile sync failed:', updateError.message)
    }
    return existing.id as string
  }

  const { data: created, error: insertError } = await db
    .from('businesses')
    .insert({
      external_account_id: s.accountId,
      ...synced,
      phone: profile.phone,
      ai_agent_services: profile.servicesSummary,
      onboarding_completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()
  if (created) return created.id as string
  if (insertError?.code === '23505') return ensureBusiness(db, s)
  throw new Error(`[socialHost] business insert failed: ${insertError?.message ?? 'unknown'}`)
}

async function ensureUser(db: SupabaseClient, s: HostSession, businessId: string): Promise<string> {
  const role = socialRole(s.role)
  const permissions = s.role === 'member' ? undefined : FULL_ACCESS
  const { data: existing, error } = await db
    .from('users')
    .select('id, business_id, role')
    .eq('external_user_id', s.userId)
    .maybeSingle()
  if (error) throw new Error(`[socialHost] user lookup failed: ${error.message}`)

  if (existing) {
    if (existing.business_id !== businessId || existing.role !== role) {
      const { error: updateError } = await db
        .from('users')
        .update({ business_id: businessId, role, ...(permissions ? { permissions } : {}) })
        .eq('id', existing.id)
      if (updateError) throw new Error(`[socialHost] user update failed: ${updateError.message}`)
    }
    return existing.id as string
  }

  const { data: created, error: insertError } = await db
    .from('users')
    .insert({
      external_user_id: s.userId,
      email: s.email,
      full_name: s.name,
      role,
      business_id: businessId,
      ...(permissions ? { permissions } : {}),
    })
    .select('id')
    .single()
  if (created) return created.id as string
  if (insertError?.code === '23505') return ensureUser(db, s, businessId)
  throw new Error(`[socialHost] user insert failed: ${insertError?.message ?? 'unknown'}`)
}

/**
 * Resolves (and lazily creates) the social business + user for the current
 * host session. Memoised per request via React cache().
 */
export const getSocialIdentity = cache(async (): Promise<SocialIdentity | null> => {
  const session = await getHostSession()
  if (!session) return null
  const db = socialDb()
  const businessId = await ensureBusiness(db, session)
  const userId = await ensureUser(db, session, businessId)
  return {
    userId,
    businessId,
    email: session.email,
    name: session.name,
    role: session.role,
    accountId: session.accountId,
  }
})

/** Host account id for a social business id (crons / background jobs). */
export async function externalAccountIdFor(businessId: string): Promise<string | null> {
  const { data, error } = await socialDb()
    .from('businesses')
    .select('external_account_id')
    .eq('id', businessId)
    .maybeSingle()
  if (error) throw new Error(`[socialHost] account lookup failed: ${error.message}`)
  return (data?.external_account_id as string | null) ?? null
}
