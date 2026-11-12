'use client'

import { useCallback, useState } from 'react'
import { SLIDESHOW_MAX_IMAGES } from '@/lib/social/slideshow/slideshowTypes'
import { uploadSlideshowImages } from '@/components/social/slideshow/slideshowApi'

/** Ordered image selection: the order picked is the slide order. */
export function useSlideshowImages(initial: string[] = []) {
  const [images, setImages] = useState<string[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const add = useCallback((urls: string[]) => {
    setImages((prev) => {
      const fresh = urls.filter((u) => !prev.includes(u))
      return [...prev, ...fresh].slice(0, SLIDESHOW_MAX_IMAGES)
    })
  }, [])

  const toggle = useCallback((url: string) => {
    setImages((prev) =>
      prev.includes(url)
        ? prev.filter((u) => u !== url)
        : prev.length >= SLIDESHOW_MAX_IMAGES
          ? prev
          : [...prev, url],
    )
  }, [])

  const move = useCallback((index: number, delta: -1 | 1) => {
    setImages((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const remove = useCallback((index: number) => setImages((prev) => prev.filter((_, i) => i !== index)), [])

  const upload = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploading(true)
      setError(null)
      try {
        const result = await uploadSlideshowImages(files)
        add(result.urls)
        if (result.error) setError(result.error)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [add],
  )

  return { images, add, toggle, move, remove, upload, uploading, error }
}
