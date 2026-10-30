'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import type { SocialMediaAssetListItem } from '@/lib/social/mediaAssetTypes'
import { composerMediaFromAsset } from './ComposerVideoPicker'
import type { ComposerMedia } from './useComposerMedia'

export const VIDEO_ASSET_QUERY_PARAM = 'videoAssetId'

/** Loads a Library video into the composer when Create is opened with `?videoAssetId=`. */
export function useVideoAssetFromQuery(onLoad: (media: ComposerMedia) => void) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const appliedRef = useRef<string | null>(null)
  const assetId = searchParams.get(VIDEO_ASSET_QUERY_PARAM)

  useEffect(() => {
    if (!assetId || appliedRef.current === assetId) return
    appliedRef.current = assetId
    void (async () => {
      try {
        const res = await fetch(`/api/social/media-assets?id=${encodeURIComponent(assetId)}&limit=1`)
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(json.error || 'Could not load that video')
        }
        const json = (await res.json()) as { assets?: SocialMediaAssetListItem[] }
        const asset = json.assets?.[0]
        const media = asset ? composerMediaFromAsset(asset) : null
        if (!media) throw new Error('That video is no longer in your Library')
        onLoad(media)
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Could not load that video', 'error')
      }
    })()
  }, [assetId, onLoad, toast])
}
