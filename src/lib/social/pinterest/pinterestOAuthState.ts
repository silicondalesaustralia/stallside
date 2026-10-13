import { createHmac, timingSafeEqual } from 'node:crypto'
import { requirePinterestCredentials } from '@/lib/social/pinterest/pinterestConfig'

export type PinterestOAuthState = {
  businessId: string
  userId: string
  returnPath: string | null
  issuedAt: number
}

const STATE_MAX_AGE_MS = 15 * 60 * 1000

function sign(payload: string): string {
  const { appSecret } = requirePinterestCredentials()
  return createHmac('sha256', appSecret).update(payload).digest('base64url')
}

export function encodePinterestOAuthState(state: Omit<PinterestOAuthState, 'issuedAt'>): string {
  const payload = Buffer.from(JSON.stringify({ ...state, issuedAt: Date.now() })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** Returns null when the signature is wrong, the payload is malformed, or it is stale. */
export function decodePinterestOAuthState(raw: string | null): PinterestOAuthState | null {
  if (!raw) return null
  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Partial<PinterestOAuthState>
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
export function peekPinterestReturnPath(raw: string | null): string | null {
  const payload = raw?.split('.')[0]
  if (!payload) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { returnPath?: unknown }
    return typeof parsed.returnPath === 'string' ? parsed.returnPath : null
  } catch {
    return null
  }
}
