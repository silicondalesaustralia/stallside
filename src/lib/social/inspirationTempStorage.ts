import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { mimeForSniffedKind, sniffUploadKind } from '@/lib/uploads/sniffFileType'
import { inspirationExtForMime } from '@/lib/social/inspirationUploadMime'

export { inspirationExtForMime, isAllowedInspirationMime, resolveInspirationUploadMime } from '@/lib/social/inspirationUploadMime'

export const INSPIRATION_TEMP_BUCKET = 'inspiration-temp'
export const INSPIRATION_MAX_BYTES = 4 * 1024 * 1024
/** Abandoned signed PUTs (never analyzed) should not live past this. */
export const INSPIRATION_TEMP_MAX_AGE_MS = 60 * 60 * 1000
const PURGE_LIST_LIMIT = 1000
const PURGE_MAX_DELETE_PER_RUN = 200

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function buildInspirationTempPath(businessId: string, mimeType: string): string | null {
  const ext = inspirationExtForMime(mimeType)
  if (!ext) return null
  return `${businessId}/inspiration-temp/${randomUUID()}.${ext}`
}

export function isOwnedInspirationTempPath(businessId: string, storagePath: string): boolean {
  const parts = storagePath.split('/')
  if (parts.length !== 3) return false
  if (parts[0] !== businessId) return false
  if (parts[1] !== 'inspiration-temp') return false
  const file = parts[2]
  const match = file.match(/^([0-9a-f-]{36})\.(jpg|jpeg|png|webp)$/i)
  if (!match) return false
  return UUID_RE.test(match[1])
}

export async function ensureInspirationTempBucket(db: SupabaseClient): Promise<void> {
  const { data: buckets } = await db.storage.listBuckets()
  if (buckets?.some((b) => b.id === INSPIRATION_TEMP_BUCKET || b.name === INSPIRATION_TEMP_BUCKET)) {
    return
  }
  const { error } = await db.storage.createBucket(INSPIRATION_TEMP_BUCKET, {
    public: false,
    fileSizeLimit: INSPIRATION_MAX_BYTES,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Could not create ${INSPIRATION_TEMP_BUCKET} bucket: ${error.message}`)
  }
}

export async function downloadInspirationTempImage(
  db: SupabaseClient,
  storagePath: string,
): Promise<{ buffer: Buffer; mimeType: string } | { error: string }> {
  const { data, error } = await db.storage.from(INSPIRATION_TEMP_BUCKET).download(storagePath)
  if (error || !data) {
    return { error: 'Could not read uploaded screenshot. Please try again.' }
  }
  const buffer = Buffer.from(await data.arrayBuffer())
  if (buffer.length === 0) {
    return { error: 'Uploaded screenshot was empty.' }
  }
  if (buffer.length > INSPIRATION_MAX_BYTES) {
    return { error: 'Image too large (max 4 MB)' }
  }
  const kind = sniffUploadKind(buffer)
  if (kind !== 'jpeg' && kind !== 'png' && kind !== 'webp') {
    return { error: 'Upload an image file (PNG, JPG, or WebP)' }
  }
  return { buffer, mimeType: mimeForSniffedKind(kind) }
}

export async function uploadInspirationTempImage(
  db: SupabaseClient,
  businessId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ path: string } | { error: string }> {
  if (buffer.length === 0) return { error: 'Uploaded screenshot was empty.' }
  if (buffer.length > INSPIRATION_MAX_BYTES) return { error: 'Image too large (max 4 MB)' }
  const path = buildInspirationTempPath(businessId, mimeType)
  if (!path) return { error: 'Upload an image file (PNG, JPG, or WebP)' }
  await ensureInspirationTempBucket(db)
  const { error } = await db.storage.from(INSPIRATION_TEMP_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) return { error: error.message || 'Could not store screenshot temporarily' }
  return { path }
}

export async function removeInspirationTempImage(
  db: SupabaseClient,
  storagePath: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await db.storage.from(INSPIRATION_TEMP_BUCKET).remove([storagePath])
  if (error) {
    return { ok: false, error: error.message || 'Temp screenshot delete failed' }
  }
  return { ok: true }
}

export async function removeInspirationTempImageSafe(
  db: SupabaseClient,
  storagePath: string,
  logLabel = '[Inspiration]',
): Promise<void> {
  try {
    const result = await removeInspirationTempImage(db, storagePath)
    if (!result.ok) {
      console.error(`${logLabel} temp delete failed`, { storagePath, error: result.error })
    }
  } catch (err) {
    console.error(`${logLabel} temp delete failed`, {
      storagePath,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

export function isStaleInspirationTempObject(
  createdAt: string | null | undefined,
  nowMs: number,
  maxAgeMs: number = INSPIRATION_TEMP_MAX_AGE_MS,
): boolean {
  if (!createdAt) return false
  const createdMs = Date.parse(createdAt)
  if (!Number.isFinite(createdMs)) return false
  return nowMs - createdMs >= maxAgeMs
}

async function listInspirationTempPaths(
  db: SupabaseClient,
  prefix: string,
): Promise<Array<{ path: string; createdAt: string | null }>> {
  const out: Array<{ path: string; createdAt: string | null }> = []
  let offset = 0
  for (;;) {
    const { data, error } = await db.storage.from(INSPIRATION_TEMP_BUCKET).list(prefix || undefined, {
      limit: PURGE_LIST_LIMIT,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) {
      throw new Error(`Failed to list ${INSPIRATION_TEMP_BUCKET}/${prefix || ''}: ${error.message}`)
    }
    if (!data?.length) break
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) {
        out.push(...(await listInspirationTempPaths(db, path)))
      } else {
        out.push({ path, createdAt: item.created_at ?? null })
      }
    }
    if (data.length < PURGE_LIST_LIMIT) break
    offset += PURGE_LIST_LIMIT
  }
  return out
}

export async function purgeStaleInspirationTempObjects(
  db: SupabaseClient,
  options?: { maxAgeMs?: number; nowMs?: number },
): Promise<{ scanned: number; deleted: number; errors: string[] }> {
  const maxAgeMs = options?.maxAgeMs ?? INSPIRATION_TEMP_MAX_AGE_MS
  const nowMs = options?.nowMs ?? Date.now()
  const errors: string[] = []
  const listed = await listInspirationTempPaths(db, '')
  const stale = listed
    .filter((row) => isStaleInspirationTempObject(row.createdAt, nowMs, maxAgeMs))
    .slice(0, PURGE_MAX_DELETE_PER_RUN)
  if (stale.length === 0) {
    return { scanned: listed.length, deleted: 0, errors }
  }
  const { error } = await db.storage
    .from(INSPIRATION_TEMP_BUCKET)
    .remove(stale.map((row) => row.path))
  if (error) {
    errors.push(error.message)
    return { scanned: listed.length, deleted: 0, errors }
  }
  return { scanned: listed.length, deleted: stale.length, errors }
}
