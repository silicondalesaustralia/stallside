'use client'

import { useCallback, useState } from 'react'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'

type CaptionResponse = { captions?: string[]; error?: string }

export function useComposerCaption(initial = '') {
  const [caption, setCaption] = useState(initial)
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [altIndex, setAltIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [captionError, setCaptionError] = useState<string | null>(null)

  const generate = useCallback(
    async (params: {
      jobId: string | null
      renderId: string | null
      platform: SocialPublishPlatform | undefined
    }) => {
      setGenerating(true)
      setCaptionError(null)
      try {
        const res = await fetch('/api/social/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: params.jobId ?? undefined,
            renderId: params.renderId ?? undefined,
            platform: params.platform ?? 'instagram',
          }),
        })
        const json = (await res.json().catch(() => ({}))) as CaptionResponse
        if (!res.ok) throw new Error(json.error || `Caption failed (${res.status})`)
        const captions = (json.captions ?? []).filter((c) => c.trim())
        if (!captions.length) throw new Error('No caption came back - try again')
        setAlternatives(captions)
        setAltIndex(0)
        setCaption(captions[0])
      } catch (err) {
        setCaptionError(err instanceof Error ? err.message : 'Could not write a caption')
      } finally {
        setGenerating(false)
      }
    },
    [],
  )

  /** Cycle through the alternatives already returned; returns false when a fresh request is needed. */
  const nextAlternative = useCallback((): boolean => {
    if (alternatives.length < 2) return false
    const next = (altIndex + 1) % alternatives.length
    setAltIndex(next)
    setCaption(alternatives[next])
    return true
  }, [alternatives, altIndex])

  return { caption, setCaption, generating, captionError, generate, nextAlternative }
}
