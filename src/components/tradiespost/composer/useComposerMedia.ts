'use client'

import { useCallback, useState } from 'react'

export type ComposerMedia = {
  /** Image URL, or the video thumbnail when `video` is set. */
  url: string
  renderId: string | null
  aiGenerated: boolean
  video?: { url: string; durationSeconds: number | null } | null
  /** Ordered TikTok photo slides (includes the first). Absent = TikTok gets `url` only. */
  slides?: string[] | null
  /** 'photos': `url` tracks the first slide. 'ai': `url` is a separate 4:5 feed cover. */
  slidesKind?: 'photos' | 'ai'
}

type UploadResponse = { media?: { url: string }[]; errors?: string[]; error?: string }

export function useComposerMedia(initial: ComposerMedia | null = null) {
  const [media, setMedia] = useState<ComposerMedia | null>(initial)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/social/upload-media', { method: 'POST', body: form })
      const json = (await res.json().catch(() => ({}))) as UploadResponse
      if (!res.ok) {
        throw new Error(json.errors?.[0] || json.error || `Upload failed (${res.status})`)
      }
      const url = json.media?.[0]?.url
      if (!url) throw new Error('Upload returned no image')
      setMedia({ url, renderId: null, aiGenerated: false })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  return { media, setMedia, uploading, uploadError, upload }
}
