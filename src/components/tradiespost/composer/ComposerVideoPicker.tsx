'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, Video } from 'lucide-react'
import type { SocialMediaAssetListItem } from '@/lib/social/mediaAssetTypes'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'

type Props = {
  refreshKey: number
  onSelect: (media: ComposerMedia) => void
}

export function composerMediaFromAsset(asset: SocialMediaAssetListItem): ComposerMedia | null {
  const videoUrl = asset.processedUrl || asset.originalUrl
  if (!videoUrl) return null
  return {
    url: asset.thumbnailUrl || videoUrl,
    renderId: null,
    aiGenerated: false,
    video: { url: videoUrl, durationSeconds: asset.durationSeconds },
  }
}

export function ComposerVideoPicker({ refreshKey, onSelect }: Props) {
  const [assets, setAssets] = useState<SocialMediaAssetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/social/media-assets?limit=50')
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      const json = (await res.json()) as { assets?: SocialMediaAssetListItem[] }
      setAssets(json.assets ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your videos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading your videos…
      </p>
    )
  }
  if (error) {
    return (
      <div className="text-center">
        <p className="mb-2 text-xs text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-xs font-bold"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    )
  }
  if (!assets.length) return null

  return (
    <div className="mb-3" data-testid="composer-video-picker">
      <p className="mb-2 text-xs font-bold text-zinc-600">Pick a video from your Library</p>
      <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
        {assets.map((asset) => {
          const media = composerMediaFromAsset(asset)
          if (!media) return null
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(media)}
              className="relative aspect-[9/16] overflow-hidden rounded-lg border-2 border-[#E4E4E7] bg-zinc-100 hover:border-[#F5C518]"
            >
              {asset.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Video className="mx-auto h-6 w-6 text-zinc-400" />
              )}
              {asset.durationSeconds ? (
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-bold text-white">
                  {Math.round(asset.durationSeconds)}s
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
