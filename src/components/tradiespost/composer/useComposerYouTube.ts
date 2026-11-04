'use client'

import { useCallback, useState } from 'react'
import {
  cleanYouTubeTitle,
  EMPTY_YOUTUBE_DRAFT,
  youtubeSettingsFromDraft,
  type YouTubeSettingsDraft,
} from '@/lib/social/youtube/youtubeSettings'

/** YouTube title/privacy draft plus the derived settings payload and block reason for submit. */
export function useComposerYouTubeGate(active: boolean, caption: string) {
  const [draft, setDraft] = useState<YouTubeSettingsDraft>(EMPTY_YOUTUBE_DRAFT)
  const settings = active ? youtubeSettingsFromDraft(draft, caption) : null
  const blockReason = active && !settings ? 'Add a YouTube title.' : null
  /** Fills the title from "Write with AI" without overwriting one the seller typed. */
  const prefillTitle = useCallback((title: string) => {
    const clean = cleanYouTubeTitle(title)
    if (clean) setDraft((d) => (d.title.trim() ? d : { ...d, title: clean }))
  }, [])
  /** Same rule for tags: only fills an empty tags box. */
  const prefillTags = useCallback((tags: string[]) => {
    if (tags.length) setDraft((d) => (d.tags.trim() ? d : { ...d, tags: tags.join(', ') }))
  }, [])
  return { draft, setDraft, active, settings, blockReason, prefillTitle, prefillTags }
}

export type ComposerYouTubeState = ReturnType<typeof useComposerYouTubeGate>
