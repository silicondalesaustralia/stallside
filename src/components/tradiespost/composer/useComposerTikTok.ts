'use client'

import { useEffect, useState } from 'react'
import {
  EMPTY_TIKTOK_DRAFT,
  tiktokSettingsFromDraft,
  type TikTokCreatorInfo,
  type TikTokSettingsDraft,
} from '@/lib/social/tiktok/tiktokSettings'
import { composerTikTokBlockReason } from '@/lib/tradiespost/composer/composerTikTok'

/** Loads TikTok creator info when TikTok is selected and connected; holds the settings draft. */
export function useComposerTikTok(active: boolean) {
  const [creator, setCreator] = useState<TikTokCreatorInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<TikTokSettingsDraft>(EMPTY_TIKTOK_DRAFT)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/social/connect/tiktok/creator-info')
        const json = (await res.json().catch(() => ({}))) as {
          creator?: TikTokCreatorInfo
          error?: string
        }
        if (!res.ok || !json.creator) throw new Error(json.error || `HTTP ${res.status}`)
        if (!cancelled) setCreator(json.creator)
      } catch (err) {
        if (!cancelled) {
          setCreator(null)
          setError(err instanceof Error ? err.message : 'Could not load your TikTok account')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [active])

  return { creator, loading, error, draft, setDraft }
}

export type ComposerTikTokState = ReturnType<typeof useComposerTikTok>

/** TikTok state plus the derived settings payload and block reason for submit. */
export function useComposerTikTokGate(active: boolean, videoDurationSeconds: number | null) {
  const state = useComposerTikTok(active)
  const blockReason = composerTikTokBlockReason({ active, ...state, videoDurationSeconds })
  const settings = active && !blockReason ? tiktokSettingsFromDraft(state.draft) : null
  return { state, active, blockReason, settings }
}
