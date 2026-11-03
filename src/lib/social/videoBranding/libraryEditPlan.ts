import { parseCaptionsDoc, type CaptionsDoc } from '@/lib/social/videoClips/captionCues'
import { parseClipSpeed, scaleTimed } from '@/lib/social/videoClips/playbackSpeed'
import {
  fullSegments,
  isFullClip,
  mapCaptionsToOutput,
  mapTimedToOutput,
  outputDuration,
  type ClipSegment,
} from '@/lib/social/videoClips/timeline'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

/** Cuts, speed and voice mutes applied before branding (all in source time). */
export type LibraryEditGraph = { segments: ClipSegment[]; speed: number; audioMutes: ClipSegment[] }

export type LibraryEditPlan = {
  edit: LibraryEditGraph | null
  /** Blur areas re-timed onto the edited output. */
  blurRegions: VideoBlurRegion[]
  /** Captions and text overlays in output time, burned in last. */
  burned: Pick<CaptionsDoc, 'cues' | 'words' | 'settings' | 'overlays'>
  outputSeconds: number
}

function mapBlur(regions: VideoBlurRegion[], segments: ClipSegment[] | null, speed: number): VideoBlurRegion[] {
  const timed = regions.map((r) => ({ ...r, s: r.start, e: r.end }))
  const cut = segments ? mapTimedToOutput(timed, segments) : timed
  return scaleTimed(cut, speed).map(({ s, e, ...rest }) => ({ ...rest, start: s, end: e }))
}

/**
 * The Library editor stores clip-style edits (social_media_assets.captions) in source time.
 * Maps everything onto the edited output so one ffmpeg pass can cut, brand and caption.
 */
export function planLibraryEdit(
  rawDoc: unknown,
  blurRegions: VideoBlurRegion[],
  duration: number,
  hasAudio: boolean,
): LibraryEditPlan {
  const doc = parseCaptionsDoc(rawDoc)
  const speed = parseClipSpeed(doc.speed)
  const audioMutes = hasAudio ? (doc.audioMutes ?? []) : []
  const cut = !!doc.segments && duration > 0 && !isFullClip(doc.segments, duration)
  const segments = cut && doc.segments ? doc.segments : fullSegments(duration)
  const edited = duration > 0 && (cut || speed !== 1 || audioMutes.length > 0)
  const captions = cut ? mapCaptionsToOutput(doc.cues, doc.words, segments) : { cues: doc.cues, words: doc.words }
  const overlays = cut ? mapTimedToOutput(doc.overlays, segments) : doc.overlays

  return {
    edit: edited ? { segments, speed, audioMutes } : null,
    blurRegions: mapBlur(blurRegions, cut ? segments : null, speed),
    burned: {
      cues: scaleTimed(captions.cues, speed),
      words: scaleTimed(captions.words, speed),
      settings: doc.settings,
      overlays: scaleTimed(overlays, speed),
    },
    outputSeconds: (cut ? outputDuration(segments) : duration) / speed,
  }
}
