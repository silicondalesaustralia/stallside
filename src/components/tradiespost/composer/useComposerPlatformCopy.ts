'use client'

import { useCallback, useMemo, useState } from 'react'
import { useComposerYouTubeGate } from '@/components/tradiespost/composer/useComposerYouTube'
import { useComposerPinterestGate } from '@/components/tradiespost/composer/useComposerPinterest'
import { useComposerXGate } from '@/components/tradiespost/composer/useComposerX'
import type { PlatformCaptions, SocialConnectionState, SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { effectiveCaption } from '@/lib/tradiespost/composer/captionLimits'
import type { PlatformTextDraft } from '@/lib/tradiespost/composer/platformText'

/** Each platform's own caption (blank = main caption) plus the YouTube, Pinterest and X text gates. */
export function useComposerPlatformCopy(params: {
  platforms: SocialPublishPlatform[]
  connected: SocialConnectionState
  caption: string
  linkedUrl: string | null
}) {
  const { platforms, connected, caption, linkedUrl } = params
  const [overrides, setOverrides] = useState<PlatformCaptions>({})
  const captionFor = (platform: SocialPublishPlatform) => effectiveCaption(platform, caption, overrides)
  const isOn = (p: SocialPublishPlatform) => platforms.includes(p) && connected[p]
  const youtube = useComposerYouTubeGate(isOn('youtube'), captionFor('youtube'))
  const pinterest = useComposerPinterestGate(isOn('pinterest'), captionFor('pinterest'), linkedUrl)
  const x = useComposerXGate(isOn('x'), caption)

  const setOverride = useCallback((platform: SocialPublishPlatform, text: string) => {
    setOverrides((prev) => ({ ...prev, [platform]: text }))
  }, [])

  const { setDraft: setYouTubeDraft } = youtube
  const { setDraft: setPinterestDraft } = pinterest
  const { setText: setXText, resetText: resetXText } = x
  const xText = x.touched ? x.text : null

  const text = useMemo<PlatformTextDraft>(
    () => ({
      captions: overrides,
      youtubeTitle: youtube.draft.title,
      youtubeTags: youtube.draft.tags,
      pinterestTitle: pinterest.draft.title,
      xText,
    }),
    [overrides, youtube.draft.title, youtube.draft.tags, pinterest.draft.title, xText],
  )

  const applyText = useCallback(
    (next: PlatformTextDraft) => {
      setOverrides(next.captions)
      setYouTubeDraft((d) => ({ ...d, title: next.youtubeTitle, tags: next.youtubeTags }))
      setPinterestDraft((d) => ({ ...d, title: next.pinterestTitle }))
      if (next.xText === null) resetXText()
      else setXText(next.xText)
    },
    [setYouTubeDraft, setPinterestDraft, setXText, resetXText],
  )

  return { overrides, setOverride, captionFor, youtube, pinterest, x, text, applyText }
}

export type ComposerPlatformCopy = ReturnType<typeof useComposerPlatformCopy>
