'use client'

import { useState } from 'react'
import {
  EMPTY_YOUTUBE_DRAFT,
  youtubeSettingsFromDraft,
  type YouTubeSettingsDraft,
} from '@/lib/social/youtube/youtubeSettings'

/** YouTube title/privacy draft plus the derived settings payload and block reason for submit. */
export function useComposerYouTubeGate(active: boolean, caption: string) {
  const [draft, setDraft] = useState<YouTubeSettingsDraft>(EMPTY_YOUTUBE_DRAFT)
  const settings = active ? youtubeSettingsFromDraft(draft, caption) : null
  const blockReason = active && !settings ? 'Add a YouTube title.' : null
  return { draft, setDraft, active, settings, blockReason }
}

export type ComposerYouTubeState = ReturnType<typeof useComposerYouTubeGate>
