'use client'

import { useCallback, useState } from 'react'
import type { SocialJobOption } from '@/components/social/SocialJobPicker'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'

/** Linked product / pre-order page: its job id and photos, used as the post image when none is picked. */
export function useComposerLinkedItem(params: {
  initialJobId: string | null
  media: ComposerMedia | null
  setMedia: (media: ComposerMedia | null) => void
}) {
  const { media, setMedia } = params
  const [jobId, setJobId] = useState<string | null>(params.initialJobId)
  const [linkedImages, setLinkedImages] = useState<string[]>([])

  const onJobChange = useCallback(
    (id: string | null, option: SocialJobOption | null) => {
      const images = option?.imageUrls ?? []
      const showingOldLinkedPhoto = Boolean(media && !media.video && linkedImages.includes(media.url))
      setJobId(id)
      setLinkedImages(images)
      if (images[0] && (!media || showingOldLinkedPhoto)) {
        setMedia({ url: images[0], renderId: null, aiGenerated: false })
      } else if (!images.length && showingOldLinkedPhoto) {
        setMedia(null)
      }
    },
    [media, linkedImages, setMedia],
  )

  return { jobId, onJobChange, linkedImages }
}
