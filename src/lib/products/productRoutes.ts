// KIT SHIM - OAuth return paths point at the host's /social pages.
import type { ProductId } from '@/lib/products/productTypes'
import { OAUTH_RETURN_PATHS, SOCIAL_PATHS, hostPublicOrigin } from '@/lib/socialHost/hostConfig'

const ALLOWLIST = new Set<string>(OAUTH_RETURN_PATHS)

export function parseOAuthReturnPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://') || path.includes('\\')) return null
  try {
    const decoded = decodeURIComponent(path)
    if (decoded.includes('://') || decoded.includes('//') || decoded.includes('\\')) return null
  } catch {
    return null
  }
  const pathname = path.split(/[?#]/)[0]
  return ALLOWLIST.has(pathname) ? pathname : null
}

export function socialIntegrationsReturnUrl(input: {
  requestOrigin?: string
  product?: ProductId
  returnPath?: string | null
}): string {
  const base = (input.requestOrigin || hostPublicOrigin()).replace(/\/$/, '')
  return `${base}${parseOAuthReturnPath(input.returnPath) ?? SOCIAL_PATHS.connections}`
}
