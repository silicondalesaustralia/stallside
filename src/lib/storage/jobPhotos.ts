import type { SupabaseClient } from '@supabase/supabase-js'

export const JOB_PHOTOS_BUCKET = 'job-photos'
export const JOB_PHOTO_DISPLAY_SIGNED_URL_EXPIRY_SECONDS = 60 * 60

const STORAGE_OBJECT_RE =
  /\/storage\/v1\/object\/(?:public|sign|authenticated)\/job-photos\/(.+)$/

export function jobPhotosPathFromUrl(url: string): string | null {
  let pathname: string
  try {
    pathname = new URL(url).pathname
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

/** Persist the public-form URL (no token) so we can re-sign later. */
export function canonicalJobPhotoUrl(url: string): string {
  const trimmed = url.trim()
  const path = jobPhotosPathFromUrl(trimmed)
  if (!path) return trimmed
  try {
    const origin = new URL(trimmed).origin
    return `${origin}/storage/v1/object/public/${JOB_PHOTOS_BUCKET}/${path}`
  } catch {
    return trimmed
  }
}

export function jobPhotoPathBelongsToBusiness(
  path: string,
  businessId: string,
): boolean {
  return path.startsWith(`${businessId}/`)
}

/**
 * Private job-photos objects 400 on getPublicUrl(). Sign for dashboard
 * preview and customer-facing pages. External (non-storage) URLs pass through.
 */
export async function signJobPhotoUrl(
  supabase: SupabaseClient,
  url: string | null | undefined,
  expiresIn = JOB_PHOTO_DISPLAY_SIGNED_URL_EXPIRY_SECONDS,
): Promise<string | null> {
  const trimmed = url?.trim()
  if (!trimmed) return null

  const path = jobPhotosPathFromUrl(trimmed)
  if (!path) return trimmed

  const { data, error } = await supabase.storage
    .from(JOB_PHOTOS_BUCKET)
    .createSignedUrl(path, expiresIn)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export async function signJobPhotoRecords<
  T extends { url: string; webp_url?: string | null },
>(
  supabase: SupabaseClient,
  photos: T[],
  expiresIn = JOB_PHOTO_DISPLAY_SIGNED_URL_EXPIRY_SECONDS,
): Promise<T[]> {
  const paths = new Set<string>()
  for (const photo of photos) {
    const urlPath = jobPhotosPathFromUrl(photo.url)
    const webpPath = photo.webp_url ? jobPhotosPathFromUrl(photo.webp_url) : null
    if (urlPath) paths.add(urlPath)
    if (webpPath) paths.add(webpPath)
  }

  const signedByPath = new Map<string, string>()
  const pathList = [...paths]
  if (pathList.length > 0) {
    const { data } = await supabase.storage
      .from(JOB_PHOTOS_BUCKET)
      .createSignedUrls(pathList, expiresIn)
    for (const row of data ?? []) {
      if (row.path && row.signedUrl) signedByPath.set(row.path, row.signedUrl)
    }
  }

  return photos.map((photo) => {
    const urlPath = jobPhotosPathFromUrl(photo.url)
    const webpPath = photo.webp_url ? jobPhotosPathFromUrl(photo.webp_url) : null
    const signedUrl = (urlPath && signedByPath.get(urlPath)) || photo.url
    const signedWebp =
      (webpPath && signedByPath.get(webpPath)) ||
      (urlPath && signedByPath.get(urlPath)) ||
      photo.webp_url ||
      null
    return { ...photo, url: signedUrl, webp_url: signedWebp }
  })
}

export async function downloadJobPhoto(
  supabase: SupabaseClient,
  url: string,
  expectedBusinessId?: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const trimmed = url.trim()
  if (!trimmed) return null

  const path = jobPhotosPathFromUrl(trimmed)
  if (path) {
    if (expectedBusinessId && !jobPhotoPathBelongsToBusiness(path, expectedBusinessId)) {
      return null
    }
    const { data, error } = await supabase.storage.from(JOB_PHOTOS_BUCKET).download(path)
    if (error || !data) return null
    return {
      buffer: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || 'image/webp',
    }
  }

  if (!trimmed.startsWith('https://')) return null
  const res = await fetch(trimmed)
  if (!res.ok) return null
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get('content-type') || 'image/jpeg',
  }
}
