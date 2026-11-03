'use client'

import { useCallback, useState } from 'react'
import { fetchLibraryEdit, type LibraryEdit } from './libraryEditApi'

export type CaptionStatus = { transcribing: boolean; hasTranscript: boolean }

/** Stable loader for useClipEditor that also records the Library video's auto-caption status. */
export function useLibraryEditLoader() {
  const [status, setStatus] = useState<CaptionStatus>({ transcribing: false, hasTranscript: false })

  const load = useCallback(async (id: string): Promise<LibraryEdit> => {
    const data = await fetchLibraryEdit(id)
    setStatus({ transcribing: data.transcribing, hasTranscript: data.hasTranscript })
    return data
  }, [])

  return { load, status, setStatus }
}
