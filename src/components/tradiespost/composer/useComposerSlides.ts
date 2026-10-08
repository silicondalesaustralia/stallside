'use client'

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SlideDeckResult } from '@/lib/social/tiktokSlides/slideTypes'
import {
  addSlide,
  mediaFromDeck,
  moveSlide,
  removeSlide,
  slideList,
} from '@/lib/tradiespost/composer/composerSlides'

type UploadResponse = { media?: { url: string }[]; errors?: string[]; error?: string }

const blank = (): ComposerMedia => ({ url: '', renderId: null, aiGenerated: false })

export function useComposerSlides(
  media: ComposerMedia | null,
  setMedia: Dispatch<SetStateAction<ComposerMedia | null>>,
) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const add = useCallback((url: string) => setMedia((m) => addSlide(m, url, blank)), [setMedia])
  const move = useCallback(
    (index: number, delta: -1 | 1) => setMedia((m) => (m ? moveSlide(m, index, delta) : m)),
    [setMedia],
  )
  const remove = useCallback((index: number) => setMedia((m) => (m ? removeSlide(m, index) : m)), [setMedia])
  const applyDeck = useCallback((deck: SlideDeckResult) => setMedia(mediaFromDeck(deck, blank)), [setMedia])

  const uploadAndAdd = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploading(true)
      setError(null)
      try {
        const form = new FormData()
        for (const file of files) form.append('file', file)
        const res = await fetch('/api/social/upload-media', { method: 'POST', body: form })
        const json = (await res.json().catch(() => ({}))) as UploadResponse
        if (!res.ok) throw new Error(json.errors?.[0] || json.error || `Upload failed (${res.status})`)
        for (const item of json.media ?? []) add(item.url)
        if (json.errors?.length) setError(json.errors[0])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [add],
  )

  return { slides: slideList(media), add, move, remove, applyDeck, uploadAndAdd, uploading, error }
}
