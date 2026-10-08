import type { HybridRenderListItem } from '@/lib/social/libraryRenderUtils'
import type { SocialMediaAssetListItem } from '@/lib/social/mediaAssetTypes'

export type LibraryImageItem = {
  mediaKind: 'image'
  id: string
  createdAt: string
  render: HybridRenderListItem
}

export type LibraryVideoItem = {
  mediaKind: 'video'
  id: string
  createdAt: string
  asset: SocialMediaAssetListItem
}

export type LibraryMediaItem = LibraryImageItem | LibraryVideoItem

export function mergeLibraryMedia(
  renders: HybridRenderListItem[],
  videos: SocialMediaAssetListItem[],
): LibraryMediaItem[] {
  const items: LibraryMediaItem[] = [
    ...renders.map(
      (render): LibraryImageItem => ({
        mediaKind: 'image',
        id: render.id,
        createdAt: render.created_at,
        render,
      }),
    ),
    ...videos.map(
      (asset): LibraryVideoItem => ({
        mediaKind: 'video',
        id: asset.id,
        createdAt: asset.createdAt,
        asset,
      }),
    ),
  ]

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return items
}

export function formatVideoDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return ''
  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function downloadFilenameForVideo(
  businessName: string | null | undefined,
  mimeType: string | null | undefined,
  createdAt: string,
  variant: 'original' | 'branded' = 'original',
): string {
  const slug =
    (businessName || 'stitchedup')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'stitchedup'
  const date = createdAt.slice(0, 10)
  if (variant === 'branded') {
    return `${slug}-${date}-branded.mp4`
  }
  const ext = mimeType === 'video/quicktime' ? 'mov' : 'mp4'
  return `${slug}-${date}.${ext}`
}
