import { createHmac, timingSafeEqual } from 'node:crypto'
import { requireTikTokCredentials } from '@/lib/social/tiktok/tiktokConfig'

export type TikTokOAuthState = {
  businessId: string
  userId: string
  returnPath: string | null
  issuedAt: number
}

const STATE_MAX_AGE_MS = 15 * 60 * 1000

function sign(payload: string): string {
  const { clientSecret } = requireTikTokCredentials()
  return createHmac('sha256', clientSecret).update(payload).digest('base64url')
}

export function encodeTikTokOAuthState(state: Omit<TikTokOAuthState, 'issuedAt'>): string {
  const payload = Buffer.from(JSON.stringify({ ...state, issuedAt: Date.now() })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** Returns null when the signature is wrong, the payload is malformed, or it is stale. */
export function decodeTikTokOAuthState(raw: string | null): TikTokOAuthState | null {
  if (!raw) return null
  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Partial<TikTokOAuthState>
    if (typeof parsed.businessId !== 'string' || typeof parsed.userId !== 'string') return null
    if (typeof parsed.issuedAt !== 'number' || Date.now() - parsed.issuedAt > STATE_MAX_AGE_MS) return null
    return {
      businessId: parsed.businessId,
      userId: parsed.userId,
      returnPath: typeof parsed.returnPath === 'string' ? parsed.returnPath : null,
      issuedAt: parsed.issuedAt,
    }
  } catch {
    return null
  }
}

/** Return path only (unsigned read) so error redirects land on the right page. */
export function peekTikTokReturnPath(raw: string | null): string | null {
  const payload = raw?.split('.')[0]
  if (!payload) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { returnPath?: unknown }
    return typeof parsed.returnPath === 'string' ? parsed.returnPath : null
  } catch {
    return null
  }
}
