/**
 * Short-lived Meta connect sessions for the post-OAuth Page picker.
 * Stored in Postgres so Vercel serverless callbacks and /pending share state.
 * TTL 15 minutes.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { MetaPage } from '@/lib/socialPlatforms'
import { createServiceClient } from '@/lib/supabase/server'

const TTL_MS = 15 * 60 * 1000

export interface MetaConnectPendingSession {
  businessId: string
  userId: string
  platform: 'facebook' | 'instagram'
  pages: MetaPage[]
  expiresAt: number
  demo?: boolean
}

type PendingRow = {
  id: string
  business_id: string
  user_id: string
  platform: 'facebook' | 'instagram'
  pages: MetaPage[] | string
  demo: boolean | null
  expires_at: string
}

function parsePages(raw: MetaPage[] | string): MetaPage[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? (parsed as MetaPage[]) : []
    } catch {
      return []
    }
  }
  return []
}

function rowToSession(row: PendingRow): MetaConnectPendingSession {
  return {
    businessId: row.business_id,
    userId: row.user_id,
    platform: row.platform,
    pages: parsePages(row.pages),
    expiresAt: new Date(row.expires_at).getTime(),
    demo: row.demo === true,
  }
}

async function dbClient(db?: SupabaseClient): Promise<SupabaseClient> {
  return db ?? (await createServiceClient())
}

export async function createMetaConnectPendingSession(
  input: Omit<MetaConnectPendingSession, 'expiresAt'>,
  db?: SupabaseClient,
): Promise<string> {
  const client = await dbClient(db)
  const id = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString()

  const { error } = await client.from('meta_connect_pending_sessions').insert({
    id,
    business_id: input.businessId,
    user_id: input.userId,
    platform: input.platform,
    pages: input.pages,
    demo: input.demo ?? false,
    expires_at: expiresAt,
  })

  if (error) {
    console.error('[MetaConnectPending] insert failed', error)
    throw new Error(error.message || 'Failed to create Meta connect session')
  }

  return id
}

export async function getMetaConnectPendingSession(
  sessionId: string,
  db?: SupabaseClient,
): Promise<MetaConnectPendingSession | null> {
  const client = await dbClient(db)
  const { data, error } = await client
    .from('meta_connect_pending_sessions')
    .select('id, business_id, user_id, platform, pages, demo, expires_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('[MetaConnectPending] get failed', error)
    return null
  }
  if (!data) return null

  const row = data as PendingRow
  if (Date.now() > new Date(row.expires_at).getTime()) {
    await client.from('meta_connect_pending_sessions').delete().eq('id', sessionId)
    return null
  }

  return rowToSession(row)
}

export async function consumeMetaConnectPendingSession(
  sessionId: string,
  db?: SupabaseClient,
): Promise<MetaConnectPendingSession | null> {
  const client = await dbClient(db)
  const session = await getMetaConnectPendingSession(sessionId, client)
  if (!session) return null

  const { error } = await client
    .from('meta_connect_pending_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('[MetaConnectPending] consume delete failed', error)
  }

  return session
}
