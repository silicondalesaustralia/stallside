'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { CaptionCue } from '@/lib/social/videoClips/captionCues'
import { fetchLibraryEdit, startLibraryCaptions } from './libraryEditApi'
import type { CaptionStatus } from './useLibraryEditLoader'

const POLL_MS = 5000

/** Starts auto captions for a Library video and polls until they land. `setCues` must be stable. */
export function useLibraryCaptions(
  assetId: string,
  status: CaptionStatus,
  setStatus: (next: CaptionStatus) => void,
  setCues: (cues: CaptionCue[]) => void,
) {
  const { toast } = useToast()
  const [starting, setStarting] = useState(false)
  const { transcribing } = status

  useEffect(() => {
    if (!transcribing) return
    const timer = setInterval(() => {
      fetchLibraryEdit(assetId)
        .then((data) => {
          if (data.transcribing) return
          setStatus({ transcribing: false, hasTranscript: data.hasTranscript })
          if (data.hasTranscript) {
            setCues(data.cues)
            toast('Captions are ready - check them on the timeline', 'success')
          } else {
            toast('Captions failed - your credit was refunded', 'error')
          }
        })
        .catch((err: unknown) => console.warn('[LibraryEditor] captions poll failed', err))
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [assetId, transcribing, setStatus, setCues, toast])

  async function start() {
    setStarting(true)
    try {
      await startLibraryCaptions(assetId)
      setStatus({ ...status, transcribing: true })
      toast('Making captions - this takes about a minute', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not start captions', 'error')
    } finally {
      setStarting(false)
    }
  }

  return { ...status, starting, start }
}
