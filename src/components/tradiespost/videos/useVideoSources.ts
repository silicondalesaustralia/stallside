'use client'

import { useCallback, useEffect, useState } from 'react'
import type { VideoSourceListItem } from '@/lib/social/videoClips/types'

const POLL_MS = 5000

const isActive = (status: string | null | undefined) =>
  status === 'pending' || status === 'processing'

function hasActiveJob(sources: VideoSourceListItem[]): boolean {
  return sources.some(
    (s) => isActive(s.latestJob?.status) || s.clips.some((c) => isActive(c.captionJobStatus)),
  )
}

async function fetchSources(): Promise<VideoSourceListItem[]> {
  const res = await fetch('/api/social/videos')
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Could not load videos')
  }
  const json = (await res.json()) as { sources?: VideoSourceListItem[] }
  return json.sources ?? []
}

export function useVideoSources() {
  const [sources, setSources] = useState<VideoSourceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    () =>
      fetchSources()
        .then((next) => {
          setSources(next)
          setError(null)
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load videos'))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  const polling = hasActiveJob(sources)
  useEffect(() => {
    if (!polling) return
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [polling, refresh])

  return { sources, loading, error, refresh }
}
