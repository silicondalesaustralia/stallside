import type { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeAudioMutes } from '@/lib/social/videoClips/audioEdits'
import { parseMusicChoice } from '@/lib/social/music/musicCatalog'
import { parseCaptionsDoc, sanitizeCues, type CaptionsDoc } from '@/lib/social/videoClips/captionCues'
import { parseCaptionSettings } from '@/lib/social/videoClips/captionStyles'
import { parseClipSpeed } from '@/lib/social/videoClips/playbackSpeed'
import { sanitizeOverlays } from '@/lib/social/videoClips/textOverlays'
import { fullSegments, isFullClip, normalizeSegments } from '@/lib/social/videoClips/timeline'

export type LibraryEditAsset = {
  id: string
  storage_path: string | null
  original_url: string | null
  duration_seconds: number | string | null
  captions: unknown
  processing_status: string | null
  source_video_id: string | null
}

export const LIBRARY_EDIT_ASSET_COLUMNS =
  'id, storage_path, original_url, duration_seconds, captions, processing_status, source_video_id'

export function loadLibraryEditAsset(db: SupabaseClient, businessId: string, id: string) {
  return db
    .from('social_media_assets')
    .select(LIBRARY_EDIT_ASSET_COLUMNS)
    .eq('id', id)
    .eq('business_id', businessId)
    .is('source_video_id', null)
    .maybeSingle<LibraryEditAsset>()
}

export function libraryEditDuration(asset: Pick<LibraryEditAsset, 'duration_seconds'>, doc: CaptionsDoc): number {
  const fromAsset = Number(asset.duration_seconds)
  if (Number.isFinite(fromAsset) && fromAsset > 0) return fromAsset
  return doc.cleanDuration ?? 0
}

/** Editor payload → stored doc. Keeps the transcript; times stay in source-video seconds. */
export function sanitizeLibraryEdit(raw: unknown, asset: LibraryEditAsset): CaptionsDoc {
  const doc = parseCaptionsDoc(asset.captions)
  const duration = libraryEditDuration(asset, doc)
  const body = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const segments = normalizeSegments(body.segments, duration)
  return {
    ...doc,
    cues: sanitizeCues(body.cues, duration),
    settings: parseCaptionSettings(body.settings),
    cleanPath: asset.storage_path,
    cleanDuration: duration,
    segments: isFullClip(segments, duration) ? null : segments,
    overlays: sanitizeOverlays(body.overlays, duration),
    speed: parseClipSpeed(body.speed),
    audioMutes: sanitizeAudioMutes(body.audioMutes, duration),
    music: parseMusicChoice(body.music),
  }
}

/** Same shape the clip editor loads (see captionsApi.ClipCaptions). */
export function libraryEditResponse(asset: LibraryEditAsset, flags: { transcribing: boolean }) {
  const doc = parseCaptionsDoc(asset.captions)
  const duration = libraryEditDuration(asset, doc)
  return {
    cues: doc.cues,
    settings: doc.settings,
    durationSeconds: duration,
    segments: doc.segments ?? fullSegments(duration),
    overlays: doc.overlays,
    speed: parseClipSpeed(doc.speed),
    audioMutes: doc.audioMutes ?? [],
    music: doc.music ?? null,
    previewUrl: asset.original_url,
    rendering: asset.processing_status === 'processing',
    hasTranscript: doc.words.length > 0,
    transcribing: flags.transcribing,
  }
}

/** Stores editor changes before a render. Returns an error message for the user, or null. */
export async function saveLibraryEdit(
  db: SupabaseClient,
  businessId: string,
  id: string,
  raw: unknown,
): Promise<string | null> {
  const { data: asset, error } = await loadLibraryEditAsset(db, businessId, id)
  if (error) throw new Error(error.message)
  if (!asset) return 'Video not found'
  if (await hasActiveCaptionJob(db, id)) return 'Wait for captions to finish before saving'
  const { error: saveErr } = await db
    .from('social_media_assets')
    .update({ captions: sanitizeLibraryEdit(raw, asset), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('business_id', businessId)
  if (saveErr) throw new Error(saveErr.message)
  return null
}

export async function hasActiveCaptionJob(db: SupabaseClient, assetId: string): Promise<boolean> {
  const { count, error } = await db
    .from('social_video_caption_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('asset_id', assetId)
    .in('status', ['pending', 'processing'])
  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}
