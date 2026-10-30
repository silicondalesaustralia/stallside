'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import { useVideoAssetFromQuery } from '@/components/tradiespost/composer/useVideoAssetFromQuery'
import type { SocialWorkspaceBusiness, SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'
import {
  defaultLibrarySelectedPlatforms,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { mediaFromSavedPost } from '@/lib/tradiespost/composer/composerSlides'
import { postImageUrl } from '@/lib/tradiespost/posts/derivePostOutcome'

/** One-time composer setup: default platforms, `?fromPost=` duplication and `?videoAssetId=` clips. */
export function useComposerStartState(params: {
  business: SocialWorkspaceBusiness | null
  posts: SocialWorkspacePost[]
  connected: SocialConnectionState
  setPlatforms: (platforms: SocialPublishPlatform[]) => void
  setCaption: (caption: string) => void
  setMedia: (media: ComposerMedia | null) => void
}) {
  const { business, posts, connected, setPlatforms, setCaption, setMedia } = params
  const searchParams = useSearchParams()
  const platformsInitRef = useRef(false)
  const duplicateAppliedRef = useRef(false)

  useEffect(() => {
    if (platformsInitRef.current || !business) return
    platformsInitRef.current = true
    setPlatforms(defaultLibrarySelectedPlatforms(connected))
  }, [business, connected, setPlatforms])

  useEffect(() => {
    const fromPost = searchParams.get('fromPost')
    if (!fromPost || duplicateAppliedRef.current || !posts.length) return
    const source = posts.find((p) => p.id === fromPost)
    if (!source) return
    duplicateAppliedRef.current = true
    setCaption(source.caption ?? '')
    setMedia(mediaFromSavedPost(postImageUrl(source), source.processed_photo_urls))
  }, [searchParams, posts, setCaption, setMedia])

  useVideoAssetFromQuery(setMedia)
}
