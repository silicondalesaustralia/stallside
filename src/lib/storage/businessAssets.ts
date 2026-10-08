import type { SupabaseClient } from '@supabase/supabase-js'

export const BUSINESS_ASSETS_BUCKET = 'business-assets'
export const BUSINESS_LOGO_DISPLAY_SIGNED_URL_EXPIRY_SECONDS = 60 * 60

const STORAGE_OBJECT_RE =
  /\/storage\/v1\/object\/(?:public|sign|authenticated)\/business-assets\/(.+)$/

export function candidateLogoStoragePaths(
  businessId: string,
  logoUrl: string | null | undefined,
): string[] {
  const paths: string[] = []
  const trimmed = logoUrl?.trim()
  if (trimmed) {
    const parsed = businessAssetsPathFromLogoUrl(trimmed)
    if (parsed) paths.push(parsed)
  }
  paths.push(
    `${businessId}/logo.jpg`,
    `${businessId}/logo.jpeg`,
    `${businessId}/logo.webp`,
    `${businessId}/logo.png`,
  )
  return [...new Set(paths)]
}

export function businessAssetsPathFromLogoUrl(logoUrl: string): string | null {
  let pathname: string
  try {
    pathname = new URL(logoUrl).pathname
  } catch {
    return null
  }
  const match = pathname.match(STORAGE_OBJECT_RE)
  if (!match?.[1]) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

/**
 * Private business-assets objects 400 on getPublicUrl(). Sign for dashboard
 * preview. External (non-storage) URLs pass through.
 */
export async function signBusinessLogoUrl(
  supabase: SupabaseClient,
  logoUrl: string | null | undefined,
  expiresIn = BUSINESS_LOGO_DISPLAY_SIGNED_URL_EXPIRY_SECONDS,
): Promise<string | null> {
  const trimmed = logoUrl?.trim()
  if (!trimmed) return null

  const path = businessAssetsPathFromLogoUrl(trimmed)
  if (!path) return trimmed

  const { data, error } = await supabase.storage
    .from(BUSINESS_ASSETS_BUCKET)
    .createSignedUrl(path, expiresIn)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}
