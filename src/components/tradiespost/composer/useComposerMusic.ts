'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { MusicChoice, MusicJobView } from '@/lib/social/music/musicTypes'

type Params = { media: ComposerMedia | null; setMedia: (media: ComposerMedia | null) => void }

const POLL_MS = 2500
const MAX_POLLS = 96

const sameChoice = (a: MusicChoice | null, b: MusicChoice | null) => JSON.stringify(a) === JSON.stringify(b)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error || 'Could not add the music - try again.')
  }
  return (await res.json()) as T
}

/** Create > Add music: keeps the music-free video so the song can be changed or removed. */
export function useComposerMusic({ media, setMedia }: Params) {
  const [base, setBase] = useState<ComposerMedia | null>(media?.video ? media : null)
  const [music, setMusic] = useState<MusicChoice | null>(null)
  const [applied, setApplied] = useState<MusicChoice | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mixedUrl = useRef<string | null>(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (media?.video?.url && media.video.url === mixedUrl.current) return
    mixedUrl.current = null
    setBase(media?.video ? media : null)
    setMusic(null)
    setApplied(null)
    setError(null)
  }, [media])

  const apply = useCallback(async () => {
    if (!base?.video || !music) return
    setWorking(true)
    setError(null)
    try {
      const res = await fetch('/api/social/music/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: base.video.url, assetId: base.assetId ?? null, music }),
      })
      const { jobId } = await readJson<{ jobId: string }>(res)
      for (let i = 0; i < MAX_POLLS && alive.current; i++) {
        await wait(POLL_MS)
        const view = await readJson<MusicJobView>(await fetch(`/api/social/music/jobs/${jobId}`, { cache: 'no-store' }))
        if (view.status === 'failed') throw new Error(view.error || 'The music could not be added - try again.')
        if (view.status !== 'completed' || !view.video) continue
        if (!alive.current) return
        mixedUrl.current = view.video.url
        setApplied(music)
        setMedia({
          ...base,
          video: { url: view.video.url, durationSeconds: view.video.durationSeconds ?? base.video.durationSeconds },
          assetId: view.video.assetId,
        })
        return
      }
      if (alive.current) throw new Error('Adding the music is taking longer than usual - try again in a minute.')
    } catch (err) {
      console.error('[Music] apply failed', err)
      if (alive.current) setError(err instanceof Error ? err.message : 'Could not add the music - try again.')
    } finally {
      if (alive.current) setWorking(false)
    }
  }, [base, music, setMedia])

  const remove = useCallback(() => {
    setMusic(null)
    if (!applied || !base) return
    mixedUrl.current = null
    setApplied(null)
    setMedia(base)
  }, [applied, base, setMedia])

  const pending = Boolean(base?.video) && Boolean(music) && !sameChoice(music, applied)

  return {
    base,
    music,
    setMusic,
    applied,
    pending,
    blockReason: working
      ? 'Adding your music - one moment.'
      : pending
        ? 'Tap Add music to put the song on your video, or remove the song.'
        : null,
    working,
    error,
    apply,
    remove,
  }
}
