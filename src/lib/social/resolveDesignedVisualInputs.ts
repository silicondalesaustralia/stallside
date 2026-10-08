import type { SupabaseClient } from '@supabase/supabase-js'
import { mimeForSniffedKind, sniffUploadKind } from '@/lib/uploads/sniffFileType'
import {
  downloadInspirationTempImage,
  isOwnedInspirationTempPath,
} from '@/lib/social/inspirationTempStorage'
import {
  JOB_PHOTOS_BUCKET,
  jobPhotoPathBelongsToBusiness,
  jobPhotosPathFromUrl,
} from '@/lib/storage/jobPhotos'
import {
  DESIGNED_VISUAL_MAX_BYTES,
  type DesignedResolvedVisual,
  type DesignedVisualInput,
} from '@/lib/social/designedVisualInputs'

const SOCIAL_POSTS_BUCKET = 'social-posts'
const STORAGE_OBJECT_RE =
  /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/

export type ResolveDesignedVisualsResult =
  | { ok: true; visuals: DesignedResolvedVisual[] }
  | { ok: false; error: string; code: ResolveDesignedVisualsErrorCode }

type ResolveDesignedVisualsErrorCode = 'visual_not_found' | 'visual_forbidden' | 'visual_invalid'

function parseStorageObject(url: string): { bucket: string; path: string } | null {
  try {
    const match = new URL(url).pathname.match(STORAGE_OBJECT_RE)
    if (!match?.[1] || !match[2]) return null
    return { bucket: decodeURIComponent(match[1]), path: decodeURIComponent(match[2]) }
  } catch {
    return null
  }
}

async function downloadOwnedObject(
  db: SupabaseClient,
  bucket: string,
  path: string,
  businessId: string,
  label: string,
): Promise<{ ok: true; buffer: Buffer; mimeType: string } | { ok: false; error: string; code: ResolveDesignedVisualsErrorCode }> {
  if (bucket === JOB_PHOTOS_BUCKET && !jobPhotoPathBelongsToBusiness(path, businessId)) {
    return { ok: false, error: `${label}: that job photo is not available.`, code: 'visual_forbidden' }
  }
  if (bucket === SOCIAL_POSTS_BUCKET && !path.startsWith(`${businessId}/`)) {
    return { ok: false, error: `${label}: that library image is not available.`, code: 'visual_forbidden' }
  }
  const { data, error } = await db.storage.from(bucket).download(path)
  if (error || !data) {
    return { ok: false, error: `${label}: could not read this image.`, code: 'visual_not_found' }
  }
  const buffer = Buffer.from(await data.arrayBuffer())
  if (!buffer.length) {
    return { ok: false, error: `${label}: image was empty.`, code: 'visual_invalid' }
  }
  if (buffer.length > DESIGNED_VISUAL_MAX_BYTES) {
    return { ok: false, error: `${label}: image too large (max 4 MB).`, code: 'visual_invalid' }
  }
  const kind = sniffUploadKind(buffer)
  if (kind !== 'jpeg' && kind !== 'png' && kind !== 'webp') {
    return { ok: false, error: `${label}: use PNG, JPG, or WebP.`, code: 'visual_invalid' }
  }
  return { ok: true, buffer, mimeType: mimeForSniffedKind(kind) }
}

async function resolveOne(
  db: SupabaseClient,
  businessId: string,
  input: DesignedVisualInput,
  index: number,
): Promise<{ ok: true; visual: DesignedResolvedVisual } | { ok: false; error: string; code: ResolveDesignedVisualsErrorCode }> {
  const label = `Visual ${index + 1}`

  if (input.source === 'upload') {
    const path = input.storagePath ?? ''
    if (!isOwnedInspirationTempPath(businessId, path)) {
      return { ok: false, error: `${label}: upload is not available.`, code: 'visual_forbidden' }
    }
    const downloaded = await downloadInspirationTempImage(db, path)
    if ('error' in downloaded) {
      return { ok: false, error: `${label}: ${downloaded.error}`, code: 'visual_invalid' }
    }
    return {
      ok: true,
      visual: {
        ...input,
        buffer: downloaded.buffer,
        mimeType: downloaded.mimeType,
        label: 'Upload',
      },
    }
  }

  if (input.source === 'library') {
    const { data: render } = await db
      .from('hybrid_social_renders')
      .select('id, photo_url, result_url, business_id')
      .eq('id', input.libraryRenderId)
      .eq('business_id', businessId)
      .maybeSingle()
    if (!render) {
      return { ok: false, error: `${label}: library image is not available.`, code: 'visual_not_found' }
    }
    const candidates = [render.result_url, render.photo_url]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
    let parsed: { bucket: string; path: string } | null = null
    for (const candidate of candidates) {
      parsed = parseStorageObject(candidate)
      if (parsed) break
    }
    if (!parsed) {
      return { ok: false, error: `${label}: library image could not be loaded.`, code: 'visual_invalid' }
    }
    const downloaded = await downloadOwnedObject(db, parsed.bucket, parsed.path, businessId, label)
    if (!downloaded.ok) return downloaded
    return {
      ok: true,
      visual: { ...input, buffer: downloaded.buffer, mimeType: downloaded.mimeType, label: 'Library' },
    }
  }

  const { data: job } = await db
    .from('jobs')
    .select('id')
    .eq('id', input.jobId)
    .eq('business_id', businessId)
    .maybeSingle()
  if (!job) {
    return { ok: false, error: `${label}: that job is not available.`, code: 'visual_forbidden' }
  }
  const { data: photo } = await db
    .from('job_photos')
    .select('id, url, webp_url, job_id')
    .eq('id', input.photoId)
    .eq('job_id', input.jobId)
    .maybeSingle()
  if (!photo) {
    return { ok: false, error: `${label}: job photo was removed.`, code: 'visual_not_found' }
  }
  const rawUrl = String(photo.webp_url || photo.url || '')
  const path = jobPhotosPathFromUrl(rawUrl)
  if (!path) {
    return { ok: false, error: `${label}: job photo could not be loaded.`, code: 'visual_invalid' }
  }
  const downloaded = await downloadOwnedObject(db, JOB_PHOTOS_BUCKET, path, businessId, label)
  if (!downloaded.ok) return downloaded
  return {
    ok: true,
    visual: { ...input, buffer: downloaded.buffer, mimeType: downloaded.mimeType, label: 'Job' },
  }
}

export async function resolveDesignedVisualInputs(
  db: SupabaseClient,
  businessId: string,
  inputs: DesignedVisualInput[],
): Promise<ResolveDesignedVisualsResult> {
  const visuals: DesignedResolvedVisual[] = []
  for (let i = 0; i < inputs.length; i += 1) {
    const resolved = await resolveOne(db, businessId, inputs[i], i)
    if (!resolved.ok) return resolved
    visuals.push(resolved.visual)
  }
  return { ok: true, visuals }
}
