import type { CaptionCue } from '@/lib/social/videoClips/captionCues'
import type { CaptionSettings } from '@/lib/social/videoClips/captionStyles'
import type { TextOverlay } from '@/lib/social/videoClips/textOverlays'
import type { ClipSegment } from '@/lib/social/videoClips/timeline'

export type ClipCaptions = {
  cues: CaptionCue[]
  settings: CaptionSettings
  durationSeconds: number
  segments: ClipSegment[]
  overlays: TextOverlay[]
  speed: number
  audioMutes: ClipSegment[]
  previewUrl: string | null
  rendering: boolean
}

export type ClipEdit = Pick<ClipCaptions, 'cues' | 'settings' | 'segments' | 'overlays' | 'speed' | 'audioMutes'>

async function errorFrom(res: Response, fallback: string): Promise<Error> {
  const json = (await res.json().catch(() => ({}))) as { error?: string }
  return new Error(json.error || fallback)
}

export async function fetchClipCaptions(clipId: string): Promise<ClipCaptions> {
  const res = await fetch(`/api/social/videos/clips/${clipId}/captions`)
  if (!res.ok) throw await errorFrom(res, 'Could not load clip')
  return (await res.json()) as ClipCaptions
}

export async function saveClipCaptions(clipId: string, edit: ClipEdit): Promise<void> {
  const res = await fetch(`/api/social/videos/clips/${clipId}/captions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(edit),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not update clip')
}
