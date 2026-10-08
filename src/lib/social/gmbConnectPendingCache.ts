// Short-lived pending GMB connect sessions for post-OAuth location picker.
// TTL 15 minutes - same pattern as metaConnectPendingCache.

const TTL_MS = 15 * 60 * 1000

export interface GmbPendingLocation {
  locationResourceName: string
  locationId: string
  title: string
}

export interface GmbConnectPendingSession {
  businessId: string
  userId: string
  accountId: string
  accountName: string
  accessToken: string
  refreshToken: string | null
  tokenExpiresAt: string | null
  locations: GmbPendingLocation[]
  expiresAt: number
  demo?: boolean
}

type PendingStore = Map<string, GmbConnectPendingSession>

const globalForGmb = globalThis as unknown as { __gmbConnectPending?: PendingStore }

function getStore(): PendingStore {
  if (!globalForGmb.__gmbConnectPending) {
    globalForGmb.__gmbConnectPending = new Map()
  }
  return globalForGmb.__gmbConnectPending
}

export function createGmbConnectPendingSession(
  input: Omit<GmbConnectPendingSession, 'expiresAt'>,
): string {
  const id = crypto.randomUUID()
  getStore().set(id, {
    ...input,
    expiresAt: Date.now() + TTL_MS,
  })
  return id
}

export function getGmbConnectPendingSession(
  sessionId: string,
): GmbConnectPendingSession | null {
  const entry = getStore().get(sessionId)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    getStore().delete(sessionId)
    return null
  }
  return entry
}

export function consumeGmbConnectPendingSession(
  sessionId: string,
): GmbConnectPendingSession | null {
  const entry = getGmbConnectPendingSession(sessionId)
  if (!entry) return null
  getStore().delete(sessionId)
  return entry
}
