'use client'

import { useCallback, useMemo, useState } from 'react'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { MediaKind } from '@/components/tradiespost/composer/ComposerMediaPicker'
import { useComposerDraft } from '@/components/tradiespost/composer/useComposerDraft'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import type { SlideshowDraft } from '@/lib/social/slideshow/slideshowDraft'
import { EMPTY_COMPOSER_DRAFT, type ComposerDraftData } from '@/lib/tradiespost/composer/composerDraft'

type Field<T> = { value: T; set: (value: T) => void }

/** Composer fields <-> draft snapshot. `restoreKey` remounts the media tabs so they start from a restored draft. */
export function useComposerDraftState(params: {
  businessId: string | null
  platforms: Field<SocialPublishPlatform[]>
  headline: Field<string>
  caption: Field<string>
  media: Field<ComposerMedia | null>
  jobId: Field<string | null>
}) {
  const { businessId, platforms, headline, caption, media, jobId } = params
  const [slideshow, setSlideshow] = useState<SlideshowDraft | null>(null)
  const [restoreKey, setRestoreKey] = useState(0)
  const setPlatforms = platforms.set
  const setHeadline = headline.set
  const setCaption = caption.set
  const setMedia = media.set
  const setJobId = jobId.set

  const snapshot = useMemo<ComposerDraftData>(
    () => ({
      platforms: platforms.value,
      headline: headline.value,
      caption: caption.value,
      media: media.value,
      jobId: jobId.value,
      slideshow,
    }),
    [platforms.value, headline.value, caption.value, media.value, jobId.value, slideshow],
  )

  const apply = useCallback(
    (draft: ComposerDraftData) => {
      setPlatforms(draft.platforms)
      setHeadline(draft.headline)
      setCaption(draft.caption)
      setMedia(draft.media)
      setJobId(draft.jobId)
      setSlideshow(draft.slideshow)
      setRestoreKey((n) => n + 1)
    },
    [setPlatforms, setHeadline, setCaption, setMedia, setJobId],
  )

  const draft = useComposerDraft({ businessId, snapshot, apply })
  const initialKind: MediaKind = media.value?.video ? 'video' : media.value ? 'photo' : slideshow ? 'slideshow' : 'photo'
  const startFresh = () => draft.startFresh({ ...EMPTY_COMPOSER_DRAFT, platforms: platforms.value })

  return { draft, slideshow, setSlideshow, restoreKey, initialKind, startFresh }
}
