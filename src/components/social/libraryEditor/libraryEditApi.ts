import type { ClipCaptions } from '@/components/tradiespost/videos/captionsApi'

export type LibraryEdit = ClipCaptions & { hasTranscript: boolean; transcribing: boolean }

async function errorFrom(res: Response, fallback: string): Promise<Error> {
  const json = (await res.json().catch(() => ({}))) as { error?: string }
  return new Error(json.error || fallback)
}

export async function fetchLibraryEdit(assetId: string): Promise<LibraryEdit> {
  const res = await fetch(`/api/social/media-assets/${assetId}/edit`)
  if (!res.ok) throw await errorFrom(res, 'Could not load this video')
  return (await res.json()) as LibraryEdit
}

export async function startLibraryCaptions(assetId: string): Promise<void> {
  const res = await fetch(`/api/social/media-assets/${assetId}/transcribe`, { method: 'POST' })
  if (!res.ok) throw await errorFrom(res, 'Could not start captions')
}
