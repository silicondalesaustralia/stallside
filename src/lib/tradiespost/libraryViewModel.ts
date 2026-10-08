import { designedMetaFromContent } from '@/lib/social/designedCaptionContext'
import type { LibraryMediaItem } from '@/lib/social/libraryMediaViewModel'
import {
  formatPresetLabel,
  libraryCaptionFromContent,
} from '@/lib/social/libraryRenderUtils'
import type { SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'

export type TradiesPostLibraryFilter =
  | 'all'
  | 'ai_designed'
  | 'recreate'
  | 'uploaded'
  | 'video'
  | 'scheduled'
  | 'published'

export type TradiesPostLibraryCreationType =
  | 'ai_designed'
  | 'recreate'
  | 'uploaded'
  | 'video'
  | 'composed'

export type TradiesPostLibraryPostLinkStatus = 'scheduled' | 'published' | null

export type TradiesPostLibraryCardModel = {
  id: string
  mediaKind: 'image' | 'video'
  thumbnailUrl: string | null
  creationType: TradiesPostLibraryCreationType
  creationLabel: string
  assetStatus: string
  assetStatusLabel: string
  postLinkStatus: TradiesPostLibraryPostLinkStatus
  hasCaption: boolean
  captionPreview: string
  createdAt: string
  createdLabel: string
  durationLabel?: string
}

const CREATION_LABELS: Record<TradiesPostLibraryCreationType, string> = {
  ai_designed: 'AI Designed',
  recreate: 'Recreate',
  uploaded: 'Uploaded',
  video: 'Video',
  composed: 'Your Photos',
}

function hasRecreateMeta(content: Record<string, unknown>): boolean {
  const raw = content._recreate
  return Boolean(raw && typeof raw === 'object' && !Array.isArray(raw))
}

export function libraryCreationType(item: LibraryMediaItem): TradiesPostLibraryCreationType {
  if (item.mediaKind === 'video') return 'video'
  const content = item.render.content
  if (designedMetaFromContent(content)) return 'ai_designed'
  if (hasRecreateMeta(content)) return 'recreate'
  const source = item.render.photo_source?.trim()
  if (source === 'library' || source === 'job' || source === 'upload' || source === 'custom_prompt') {
    return 'uploaded'
  }
  return 'composed'
}

export function libraryItemUrls(item: LibraryMediaItem): string[] {
  if (item.mediaKind === 'image') {
    const url = item.render.result_url?.trim()
    return url ? [url] : []
  }
  return [item.asset.processedUrl, item.asset.originalUrl, item.asset.thumbnailUrl].filter(
    (url): url is string => Boolean(url?.trim()),
  )
}

export function buildLibraryPostUrlIndex(
  posts: SocialWorkspacePost[],
): Map<string, SocialWorkspacePost['status']> {
  const index = new Map<string, SocialWorkspacePost['status']>()
  for (const post of posts) {
    for (const url of post.photo_urls ?? []) {
      if (url?.trim()) index.set(url.trim(), post.status)
    }
    const processed = post.processed_photo_urls
    if (processed && typeof processed === 'object') {
      for (const urls of Object.values(processed)) {
        if (!Array.isArray(urls)) continue
        for (const url of urls) {
          if (url?.trim()) index.set(url.trim(), post.status)
        }
      }
    }
  }
  return index
}

export function libraryPostLinkStatus(
  item: LibraryMediaItem,
  postUrlIndex: Map<string, SocialWorkspacePost['status']>,
): TradiesPostLibraryPostLinkStatus {
  for (const url of libraryItemUrls(item)) {
    const status = postUrlIndex.get(url)
    if (status === 'posted') return 'published'
  }
  for (const url of libraryItemUrls(item)) {
    const status = postUrlIndex.get(url)
    if (status === 'scheduled') return 'scheduled'
  }
  return null
}

export function libraryCardModel(
  item: LibraryMediaItem,
  postUrlIndex: Map<string, SocialWorkspacePost['status']>,
  timeZone = 'Australia/Sydney',
): TradiesPostLibraryCardModel {
  const creationType = libraryCreationType(item)
  const postLinkStatus = libraryPostLinkStatus(item, postUrlIndex)

  if (item.mediaKind === 'video') {
    const caption = item.asset.caption?.trim() || item.asset.aboutText?.trim() || ''
    const createdAt = item.asset.createdAt
    return {
      id: item.id,
      mediaKind: 'video',
      thumbnailUrl: item.asset.thumbnailUrl,
      creationType,
      creationLabel: CREATION_LABELS.video,
      assetStatus: item.asset.processingStatus,
      assetStatusLabel:
        item.asset.processingStatus === 'processed'
          ? 'Branded'
          : item.asset.processingStatus === 'processing'
            ? 'Processing'
            : 'Ready',
      postLinkStatus,
      hasCaption: Boolean(caption),
      captionPreview: caption,
      createdAt,
      createdLabel: formatLibraryDate(createdAt, timeZone),
      durationLabel: formatDuration(item.asset.durationSeconds),
    }
  }

  const caption = libraryCaptionFromContent(item.render.content)
  const createdAt = item.render.created_at
  return {
    id: item.id,
    mediaKind: 'image',
    thumbnailUrl: item.render.result_url,
    creationType,
    creationLabel: CREATION_LABELS[creationType],
    assetStatus: item.render.status,
    assetStatusLabel: item.render.status === 'completed' ? 'Ready' : item.render.status,
    postLinkStatus,
    hasCaption: Boolean(caption.trim()),
    captionPreview: caption,
    createdAt,
    createdLabel: formatLibraryDate(createdAt, timeZone),
  }
}

function formatDuration(seconds: number | null | undefined): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return undefined
  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatLibraryDate(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-AU', {
      timeZone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return new Date(iso).toLocaleDateString('en-AU')
  }
}

export function filterLibraryItems(
  items: LibraryMediaItem[],
  filter: TradiesPostLibraryFilter,
  postUrlIndex: Map<string, SocialWorkspacePost['status']>,
): LibraryMediaItem[] {
  if (filter === 'all') return items

  return items.filter((item) => {
    const creationType = libraryCreationType(item)
    const postStatus = libraryPostLinkStatus(item, postUrlIndex)

    switch (filter) {
      case 'ai_designed':
        return creationType === 'ai_designed'
      case 'recreate':
        return creationType === 'recreate'
      case 'uploaded':
        return creationType === 'uploaded' || creationType === 'video'
      case 'video':
        return item.mediaKind === 'video'
      case 'scheduled':
        return postStatus === 'scheduled'
      case 'published':
        return postStatus === 'published'
      default:
        return true
    }
  })
}

export function searchLibraryItems(
  items: LibraryMediaItem[],
  query: string,
): LibraryMediaItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items

  return items.filter((item) => {
    if (item.mediaKind === 'video') {
      const haystack = [
        item.asset.caption,
        item.asset.aboutText,
        item.asset.jobTitle,
        item.asset.jobSuburb,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    }

    const caption = libraryCaptionFromContent(item.render.content).toLowerCase()
    const preset = formatPresetLabel(item.render.preset).toLowerCase()
    const platform = item.render.platform.toLowerCase()
    return caption.includes(q) || preset.includes(q) || platform.includes(q)
  })
}

export const TRADIESPOST_LIBRARY_FILTERS: {
  id: TradiesPostLibraryFilter
  label: string
}[] = [
  { id: 'all', label: 'All' },
  { id: 'ai_designed', label: 'AI Designed' },
  { id: 'recreate', label: 'Recreate' },
  { id: 'uploaded', label: 'Uploaded' },
  { id: 'video', label: 'Video' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
]
