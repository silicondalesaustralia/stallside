'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Download, ImageIcon, Loader2, Plus, RefreshCw, Search, Send, Sparkles, Video, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { LibraryPublishPanel } from '@/components/social/LibraryPublishPanel'
import { LibraryVideoUploadModal } from '@/components/social/LibraryVideoUploadModal'
import { VideoLibraryCard } from '@/components/social/VideoLibraryCard'
import { TradiesPostLibraryCard } from '@/components/tradiespost/library/TradiesPostLibraryCard'
import { TradiesPostLibraryEmptyState } from '@/components/tradiespost/library/TradiesPostLibraryEmptyState'
import { TradiesPostLibraryToolbar } from '@/components/tradiespost/library/TradiesPostLibraryToolbar'
import { TradiesPostCard } from '@/components/tradiespost/ui'
import { mergeLibraryMedia, type LibraryMediaItem } from '@/lib/social/libraryMediaViewModel'
import type { SocialMediaAssetListItem } from '@/lib/social/mediaAssetTypes'
import type { SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'
import type { SocialProductVariant } from '@/components/social/SocialTabPanel'
import { designedCaptionUiState } from '@/lib/social/designedCaptionContext'
import {
  defaultLibrarySelectedPlatforms,
  libraryAutomaticScheduleAvailable,
  libraryCanPublish,
  libraryCanSchedule,
  libraryHasSavedCaption,
  libraryPublishBlockMessage,
  libraryPublishUiState,
  libraryScheduleBlockMessage,
  localDateInputValue,
  socialConnectionsFromBusiness,
  submitLibraryPostNow,
  submitLibrarySchedule,
  toggleLibraryPlatform,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import {
  formatPresetKey,
  formatPresetLabel,
  libraryCaptionFromContent,
  platformSizeLabel,
  withLibraryCaption,
  type HybridRenderListItem,
} from '@/lib/social/libraryRenderUtils'
import { FORMAT_ACCENTS } from '@/lib/social/socialDesignTokens'
import { parseSocialTextStyles } from '@/lib/social/socialTextStyle'
import type { SocialTextStyles } from '@/lib/social/socialTextStyle'
import { InfoGuide } from '@/components/ui/InfoGuide'
import {
  TRADIESPOST_LIBRARY_FILTERS,
  buildLibraryPostUrlIndex,
  filterLibraryItems,
  libraryCardModel,
  libraryPostLinkStatus,
  searchLibraryItems,
  type TradiesPostLibraryFilter,
} from '@/lib/tradiespost/libraryViewModel'

function quoteFieldsFromContent(content: Record<string, unknown>) {
  const quoteText = typeof content.quoteText === 'string' ? content.quoteText.trim() : ''
  const customerName = typeof content.customerName === 'string' ? content.customerName.trim() : ''
  return { quoteText, customerName }
}

async function downloadImageUrl(url: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'webp'
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `stitchedup-render-${Date.now()}.${ext}`
  a.click()
  URL.revokeObjectURL(a.href)
}

type LibraryBusiness = {
  name?: string | null
  brand_color?: string | null
  social_text_styles?: SocialTextStyles | null
  facebook_page_id?: string | null
  instagram_account_id?: string | null
  gmb_account_id?: string | null
}

export function LibraryTab({
  business,
  onPostCreated,
  variant = 'stitchedup',
  posts = [],
  createHref = '/dashboard/social?tab=create',
  plannerHref = '/dashboard/social?tab=planner',
}: {
  business?: LibraryBusiness | null
  onPostCreated?: () => void
  variant?: SocialProductVariant
  posts?: SocialWorkspacePost[]
  createHref?: string
  plannerHref?: string
} = {}) {
  const isTradiesPost = variant === 'tradiespost'
  const { toast } = useToast()
  const connected = socialConnectionsFromBusiness(business)
  const [renders, setRenders] = useState<HybridRenderListItem[]>([])
  const [videos, setVideos] = useState<SocialMediaAssetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null)
  const [captionLoadingId, setCaptionLoadingId] = useState<string | null>(null)
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedById, setSelectedById] = useState<Record<string, SocialPublishPlatform[]>>({})
  const [scheduleOpenId, setScheduleOpenId] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState(localDateInputValue())
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [publishingModeById, setPublishingModeById] = useState<
    Record<string, 'automatic' | 'manual'>
  >({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})
  const [libraryFilter, setLibraryFilter] = useState<TradiesPostLibraryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadRenders = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const [renderRes, videoRes] = await Promise.all([
        fetch('/api/social/hybrid-renders?limit=50&status=completed'),
        fetch('/api/social/media-assets?limit=50&status=ready'),
      ])
      if (!renderRes.ok) {
        const json = await renderRes.json().catch(() => ({}))
        throw new Error(json.error || `HTTP ${renderRes.status}`)
      }
      const renderJson = await renderRes.json()
      setRenders(renderJson.renders || [])

      if (videoRes.ok) {
        const videoJson = await videoRes.json()
        setVideos(videoJson.assets || [])
      } else {
        setVideos([])
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRenders()
  }, [loadRenders])

  const libraryItems: LibraryMediaItem[] = useMemo(
    () => mergeLibraryMedia(renders, videos),
    [renders, videos],
  )
  const postUrlIndex = useMemo(() => buildLibraryPostUrlIndex(posts), [posts])
  const filteredLibraryItems = useMemo(() => {
    const filtered = filterLibraryItems(libraryItems, libraryFilter, postUrlIndex)
    return searchLibraryItems(filtered, searchQuery)
  }, [libraryItems, libraryFilter, postUrlIndex, searchQuery])

  function platformsFor(renderId: string): SocialPublishPlatform[] {
    return selectedById[renderId] ?? defaultLibrarySelectedPlatforms(connected)
  }

  function expandCard(renderId: string) {
    setExpandedId(renderId)
    setExpandedVideoId(null)
    setSelectedById((prev) =>
      prev[renderId] ? prev : { ...prev, [renderId]: defaultLibrarySelectedPlatforms(connected) },
    )
    setCardErrors((prev) => ({ ...prev, [renderId]: '' }))
  }

  async function handleDownload(render: HybridRenderListItem) {
    try {
      await downloadImageUrl(render.result_url)
      toast('Image downloaded', 'success')
    } catch {
      toast('Download failed', 'error')
    }
  }

  function setRenderCaption(renderId: string, text: string) {
    setRenders((prev) =>
      prev.map((row) =>
        row.id === renderId
          ? { ...row, content: withLibraryCaption(row.content, text) }
          : row,
      ),
    )
    setCaptionDrafts((prev) => ({ ...prev, [renderId]: text }))
  }

  async function persistCaption(renderId: string, text: string) {
    const res = await fetch(`/api/social/hybrid-renders/${renderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: text }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error || 'Could not save caption')
    }
  }

  function captionFor(render: HybridRenderListItem) {
    return captionDrafts[render.id] ?? libraryCaptionFromContent(render.content)
  }

  async function ensureCaptionSaved(render: HybridRenderListItem): Promise<string> {
    const draft = captionFor(render).trim()
    const saved = libraryCaptionFromContent(render.content)
    if (draft && draft !== saved) {
      setRenderCaption(render.id, draft)
      await persistCaption(render.id, draft)
    }
    return draft
  }

  async function handleCopyCaption(render: HybridRenderListItem) {
    const existing = captionFor(render).trim()
    if (!existing) {
      toast('Generate a caption first', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(existing)
      toast('Caption copied', 'success')
    } catch {
      toast('Could not copy caption', 'error')
    }
  }

  async function handleGenerateCaption(render: HybridRenderListItem) {
    setCaptionLoadingId(render.id)
    try {
      const { quoteText, customerName } = quoteFieldsFromContent(render.content)
      const res = await fetch('/api/social/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renderId: render.id,
          jobId: render.job_id || undefined,
          platform: render.platform,
          ...(quoteText ? { quoteText, customerName } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Caption failed')
      const text = json.captions?.[0]
      if (!text?.trim()) throw new Error('No caption returned')
      setRenderCaption(render.id, text)
      await persistCaption(render.id, text)
      toast('Caption saved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not generate caption', 'error')
    } finally {
      setCaptionLoadingId(null)
    }
  }

  async function handleCaptionBlur(render: HybridRenderListItem) {
    const draft = captionDrafts[render.id]
    if (draft == null) return
    const trimmed = draft.trim()
    const saved = libraryCaptionFromContent(render.content)
    if (!trimmed) {
      setCaptionDrafts((prev) => ({ ...prev, [render.id]: saved }))
      return
    }
    if (trimmed === saved) return
    try {
      setRenderCaption(render.id, trimmed)
      await persistCaption(render.id, trimmed)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save caption', 'error')
    }
  }

  async function browserFetch(
    url: string,
    init: { method: string; headers?: Record<string, string>; body?: string },
  ) {
    const res = await fetch(url, init)
    return {
      ok: res.ok,
      status: res.status,
      json: () => res.json() as Promise<Record<string, unknown>>,
    }
  }

  async function handlePostNow(
    render: HybridRenderListItem,
    platformsOverride?: SocialPublishPlatform[],
  ): Promise<boolean> {
    if (platformsOverride?.length) {
      setSelectedById((prev) => ({ ...prev, [render.id]: platformsOverride }))
    }
    const caption = captionFor(render)
    const selected = platformsOverride?.length ? platformsOverride : platformsFor(render.id)
    const gate = libraryCanPublish({ caption, selected, connected })
    if (!gate.ok) {
      setCardErrors((prev) => ({ ...prev, [render.id]: libraryPublishBlockMessage(gate.reason) }))
      return false
    }
    setSubmittingId(render.id)
    setCardErrors((prev) => ({ ...prev, [render.id]: '' }))
    try {
      const savedCaption = await ensureCaptionSaved(render)
      await submitLibraryPostNow(
        {
          caption: savedCaption,
          platforms: gate.platforms,
          resultUrl: render.result_url,
          jobId: render.job_id,
        },
        browserFetch,
      )
      toast('Published successfully.', 'success')
      onPostCreated?.()
      return true
    } catch (err) {
      setCardErrors((prev) => ({
        ...prev,
        [render.id]: err instanceof Error ? err.message : 'Publish failed',
      }))
      return false
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleSchedule(render: HybridRenderListItem) {
    const caption = captionFor(render)
    const selected = platformsFor(render.id)
    const publishingMode =
      publishingModeById[render.id] ??
      (libraryAutomaticScheduleAvailable(selected, connected) ? 'automatic' : 'manual')
    const gate = libraryCanSchedule({ caption, selected, connected, publishingMode })
    if (!gate.ok) {
      setCardErrors((prev) => ({
        ...prev,
        [render.id]: libraryScheduleBlockMessage(gate.reason),
      }))
      return
    }
    if (!scheduledDate) {
      setCardErrors((prev) => ({ ...prev, [render.id]: 'Pick a date' }))
      return
    }
    setSubmittingId(render.id)
    setCardErrors((prev) => ({ ...prev, [render.id]: '' }))
    try {
      const savedCaption = await ensureCaptionSaved(render)
      await submitLibrarySchedule(
        {
          caption: savedCaption,
          platforms: gate.platforms,
          resultUrl: render.result_url,
          jobId: render.job_id,
          scheduledDate,
          scheduledTime,
          publishingMode: gate.publishingMode,
        },
        browserFetch,
      )
      toast('Post scheduled.', 'success')
      setScheduleOpenId(null)
      onPostCreated?.()
    } catch (err) {
      setCardErrors((prev) => ({
        ...prev,
        [render.id]: err instanceof Error ? err.message : 'Could not schedule post',
      }))
    } finally {
      setSubmittingId(null)
    }
  }

  function expandScheduleForImage(renderId: string) {
    expandCard(renderId)
    setScheduleOpenId(renderId)
    const selected = platformsFor(renderId)
    setPublishingModeById((prev) => ({
      ...prev,
      [renderId]:
        libraryAutomaticScheduleAvailable(selected, connected) ? prev[renderId] ?? 'automatic' : 'manual',
    }))
  }

  function renderImageExpandedDetail(render: HybridRenderListItem) {
    const draft = captionFor(render)
    const ui = designedCaptionUiState(draft)
    const busy = captionLoadingId === render.id

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-black text-[#18181B]">Preview & publish</p>
          <button
            type="button"
            onClick={() => {
              setExpandedId(null)
              setScheduleOpenId(null)
            }}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={render.result_url}
          alt=""
          className="max-h-[420px] w-full rounded-xl object-contain bg-zinc-50"
        />
        {ui.showEditor ? (
          <>
            <p className="flex items-center gap-0.5 text-[11px] font-semibold text-zinc-600">
              Caption
              <InfoGuide topic="caption" />
            </p>
            <textarea
              value={draft}
              onChange={(e) =>
                setCaptionDrafts((prev) => ({ ...prev, [render.id]: e.target.value }))
              }
              onBlur={() => void handleCaptionBlur(render)}
              rows={4}
              className="w-full resize-y rounded-xl border border-zinc-200 px-3 py-2 text-sm leading-relaxed text-zinc-700"
              data-testid={`library-caption-editor-${render.id}`}
            />
          </>
        ) : (
          <p className="text-xs text-zinc-400">No caption yet</p>
        )}
        <div className="flex flex-wrap gap-2">
          {ui.showGenerate && (
            <button
              type="button"
              onClick={() => void handleGenerateCaption(render)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-xl bg-[#F5C518] px-3 py-2 text-xs font-bold text-[#18181B] disabled:opacity-50"
              data-testid={`library-generate-caption-${render.id}`}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate caption
            </button>
          )}
          {ui.showCopy && (
            <button
              type="button"
              onClick={() => void handleCopyCaption(render)}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy caption
            </button>
          )}
          {ui.showRegenerate && (
            <button
              type="button"
              onClick={() => void handleGenerateCaption(render)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 disabled:opacity-50"
              data-testid={`library-regenerate-caption-${render.id}`}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Regenerate
            </button>
          )}
        </div>
        <LibraryPublishPanel
          render={render}
          caption={draft}
          connected={connected}
          selected={platformsFor(render.id)}
          onTogglePlatform={(platform) => {
            const next = toggleLibraryPlatform(platformsFor(render.id), platform)
            setSelectedById((prev) => ({ ...prev, [render.id]: next }))
            if (!libraryAutomaticScheduleAvailable(next, connected)) {
              setPublishingModeById((prev) => ({ ...prev, [render.id]: 'manual' }))
            }
          }}
          scheduleOpen={scheduleOpenId === render.id}
          onScheduleOpen={(open) => {
            setScheduleOpenId(open ? render.id : null)
            if (open) {
              const selected = platformsFor(render.id)
              setPublishingModeById((prev) => ({
                ...prev,
                [render.id]:
                  libraryAutomaticScheduleAvailable(selected, connected)
                    ? prev[render.id] ?? 'automatic'
                    : 'manual',
              }))
            }
          }}
          scheduledDate={scheduledDate}
          scheduledTime={scheduledTime}
          onScheduledDate={setScheduledDate}
          onScheduledTime={setScheduledTime}
          publishingMode={
            publishingModeById[render.id] ??
            (libraryAutomaticScheduleAvailable(platformsFor(render.id), connected)
              ? 'automatic'
              : 'manual')
          }
          onPublishingMode={(mode) =>
            setPublishingModeById((prev) => ({ ...prev, [render.id]: mode }))
          }
          submitting={submittingId === render.id}
          error={cardErrors[render.id] || null}
          onPostNow={() => void handlePostNow(render)}
          onSchedule={() => void handleSchedule(render)}
          onDownload={() => void handleDownload(render)}
          onCopy={() => void handleCopyCaption(render)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FAFAF8] to-[#F5F3ED]/50">
        <Loader2 className={`h-8 w-8 animate-spin ${isTradiesPost ? 'text-[#F5C518]' : 'text-[#FFD700]'}`} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-12 text-center shadow-sm">
        <p className="font-semibold text-[#444] mb-2">Could not load your generated images</p>
        <p className="text-sm text-[#888] mb-4">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadRenders()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2 text-sm font-black text-black hover:bg-yellow-400 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    )
  }

  if (!libraryItems.length) {
    return (
      <>
        {isTradiesPost ? (
          <TradiesPostLibraryEmptyState
            createHref={createHref}
            plannerHref={plannerHref}
            onUploadVideo={() => setUploadOpen(true)}
          />
        ) : (
          <div className="rounded-2xl border border-[#EDEAE2]/80 bg-white p-8 sm:p-16 text-center shadow-sm">
            <ImageIcon className="mx-auto mb-3 h-12 w-12 text-[#E0DDD5]" />
            <p className="mb-1 inline-flex items-center justify-center gap-0.5 font-black text-black">
              Your Library is empty
              <InfoGuide topic="library" />
            </p>
            <p className="mb-6 text-sm text-[#888]">
              Branded images from Create and Week Ahead appear here. You can also upload short
              videos for preview and download.
            </p>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-black text-black hover:bg-yellow-400"
            >
              <Video className="h-4 w-4" />
              Upload video
            </button>
          </div>
        )}
        <LibraryVideoUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onComplete={() => void loadRenders()}
        />
      </>
    )
  }

  if (isTradiesPost) {
    const expandedRender = expandedId ? renders.find((r) => r.id === expandedId) : null
    const expandedVideo = expandedVideoId ? videos.find((v) => v.id === expandedVideoId) : null

    return (
      <>
        <div className="space-y-4">
          <TradiesPostLibraryToolbar
            filter={libraryFilter}
            onFilterChange={setLibraryFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            itemCount={filteredLibraryItems.length}
            onAddMenuToggle={() => setAddMenuOpen((open) => !open)}
            addMenuOpen={addMenuOpen}
            onUploadVideo={() => setUploadOpen(true)}
          />

          {(expandedRender || expandedVideo) && (
            <TradiesPostCard padding="md" className="border-[#F5C518]/30">
              {expandedRender ? renderImageExpandedDetail(expandedRender) : null}
              {expandedVideo ? (
                <VideoLibraryCard
                  asset={expandedVideo}
                  businessName={business?.name}
                  videoHeadlineDefaults={{
                    brandColor: business?.brand_color ?? null,
                    socialTextStyles: parseSocialTextStyles(business?.social_text_styles),
                  }}
                  expanded
                  onExpand={() => setExpandedVideoId(expandedVideo.id)}
                  onCollapse={() => setExpandedVideoId(null)}
                  onDeleted={() => void loadRenders()}
                  onAssetUpdated={(patch) => {
                    setVideos((prev) =>
                      prev.map((row) => (row.id === patch.id ? { ...row, ...patch } : row)),
                    )
                  }}
                />
              ) : null}
            </TradiesPostCard>
          )}

          {filteredLibraryItems.length === 0 ? (
            <TradiesPostLibraryEmptyState
              filtered
              createHref={createHref}
              plannerHref={plannerHref}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredLibraryItems.map((item) => {
                const model = libraryCardModel(item, postUrlIndex)
                const selected =
                  (item.mediaKind === 'image' && expandedId === item.id) ||
                  (item.mediaKind === 'video' && expandedVideoId === item.id)

                if (item.mediaKind === 'video') {
                  const asset = item.asset
                  return (
                    <TradiesPostLibraryCard
                      key={item.id}
                      model={model}
                      selected={selected}
                      onView={() => {
                        setExpandedVideoId(item.id)
                        setExpandedId(null)
                      }}
                      onDownload={() => {
                        const url =
                          asset.processingStatus === 'processed' && asset.processedUrl
                            ? asset.processedUrl
                            : asset.originalUrl
                        if (!url) return
                        void fetch(url)
                          .then((r) => r.blob())
                          .then((blob) => {
                            const a = document.createElement('a')
                            a.href = URL.createObjectURL(blob)
                            a.download = `video-${item.id.slice(0, 8)}.mp4`
                            a.click()
                            URL.revokeObjectURL(a.href)
                            toast('Video downloaded', 'success')
                          })
                          .catch(() => toast('Download failed', 'error'))
                      }}
                      onCopyCaption={
                        asset.caption?.trim()
                          ? () => {
                              void navigator.clipboard.writeText(asset.caption!.trim())
                              toast('Caption copied', 'success')
                            }
                          : undefined
                      }
                      canCopyCaption={Boolean(asset.caption?.trim())}
                      onDelete={() => {
                        if (!window.confirm('Remove this video from your Library?')) return
                        void fetch(`/api/social/media-assets/${asset.id}`, { method: 'DELETE' })
                          .then(async (res) => {
                            if (!res.ok) {
                              const json = await res.json().catch(() => ({}))
                              throw new Error((json.error as string) || 'Delete failed')
                            }
                            toast('Video removed', 'success')
                            if (expandedVideoId === item.id) setExpandedVideoId(null)
                            void loadRenders()
                          })
                          .catch((err) =>
                            toast(err instanceof Error ? err.message : 'Could not delete video', 'error'),
                          )
                      }}
                    />
                  )
                }

                const render = item.render
                const draft = captionFor(render)
                const scheduleGate = libraryCanSchedule({
                  caption: draft,
                  selected: platformsFor(render.id),
                  connected,
                  publishingMode:
                    publishingModeById[render.id] ??
                    (libraryAutomaticScheduleAvailable(platformsFor(render.id), connected)
                      ? 'automatic'
                      : 'manual'),
                })
                const showPostNow = libraryPublishUiState(connected).showPostNow

                return (
                  <TradiesPostLibraryCard
                    key={item.id}
                    model={model}
                    selected={selected}
                    connected={connected}
                    onView={() => expandCard(render.id)}
                    onSchedule={() => expandScheduleForImage(render.id)}
                    onPostNow={async (platforms) => handlePostNow(render, platforms)}
                    onDownload={() => void handleDownload(render)}
                    onCopyCaption={() => void handleCopyCaption(render)}
                    canPostNow={showPostNow}
                    canSchedule={scheduleGate.ok}
                    canCopyCaption={libraryHasSavedCaption(draft)}
                    postNowSubmitting={submittingId === render.id}
                    postNowError={cardErrors[render.id] || null}
                  />
                )
              })}
            </div>
          )}
        </div>
        <LibraryVideoUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onComplete={() => void loadRenders()}
        />
      </>
    )
  }

  function renderImageCard(render: HybridRenderListItem) {
    const formatKey = formatPresetKey(render.preset)
    const accent = formatKey ? FORMAT_ACCENTS[formatKey] : null
    const FormatIcon = accent?.Icon
    const draft = captionFor(render)
    const ui = designedCaptionUiState(draft)
    const busy = captionLoadingId === render.id
    const expanded = expandedId === render.id
    const postLink = libraryPostLinkStatus(
      { mediaKind: 'image', id: render.id, createdAt: render.created_at, render },
      postUrlIndex,
    )

    return (
      <article
        key={render.id}
        className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:mb-4 ${
          expanded ? 'border-[#FFD700]' : 'border-[#EDEAE2]/80'
        }`}
      >
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={render.result_url}
            alt=""
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {postLink ? (
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black shadow-sm ${
                postLink === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {postLink === 'published' ? 'Published' : 'Scheduled'}
            </span>
          ) : null}
        </div>
        <div className="p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {accent && FormatIcon ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${accent.badgeBg} ${accent.badgeIcon}`}
              >
                <FormatIcon className="h-3 w-3" />
                {formatPresetLabel(render.preset)}
              </span>
            ) : (
              <span className="rounded-full bg-[#FFFBEA] px-2 py-0.5 text-[10px] font-black text-[#886600]">
                {formatPresetLabel(render.preset)}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
              {platformSizeLabel(render.platform)}
            </span>
          </div>
          {expanded ? (
            ui.showEditor ? (
              <>
                <p className="mt-2 flex items-center gap-0.5 text-[11px] font-semibold text-[#666]">
                  Caption
                  <InfoGuide topic="caption" />
                </p>
                <textarea
                  value={draft}
                  onChange={(e) =>
                    setCaptionDrafts((prev) => ({ ...prev, [render.id]: e.target.value }))
                  }
                  onBlur={() => void handleCaptionBlur(render)}
                  rows={4}
                  className="mt-2 w-full resize-y rounded-lg border border-[#EDEAE2] px-2.5 py-2 text-xs leading-relaxed text-[#555]"
                  data-testid={`library-caption-editor-${render.id}`}
                />
              </>
            ) : (
              <p className="mt-2 text-[11px] text-[#BBB]">No caption yet</p>
            )
          ) : (
            <p
              className={`mt-2 text-xs leading-relaxed ${draft.trim() ? 'line-clamp-2 text-[#555]' : 'text-[#BBB]'}`}
            >
              {draft.trim() || 'No caption yet'}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ui.showGenerate && (
              <button
                type="button"
                onClick={() => void handleGenerateCaption(render)}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-lg bg-[#FFD700] px-2.5 py-1.5 text-[11px] font-bold text-black disabled:opacity-50"
                data-testid={`library-generate-caption-${render.id}`}
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Generate caption
              </button>
            )}
            {ui.showGenerate && <InfoGuide topic="caption" />}
            {expanded && ui.showCopy && (
              <button
                type="button"
                onClick={() => void handleCopyCaption(render)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EDEAE2] px-2.5 py-1.5 text-[11px] font-semibold text-[#555]"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            )}
            {expanded && ui.showRegenerate && (
              <button
                type="button"
                onClick={() => void handleGenerateCaption(render)}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EDEAE2] px-2.5 py-1.5 text-[11px] font-semibold text-[#555] disabled:opacity-50"
                data-testid={`library-regenerate-caption-${render.id}`}
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Regenerate
              </button>
            )}
            {expanded && ui.showRegenerate && <InfoGuide topic="regenerateCaption" />}
            {!expanded && (
              <button
                type="button"
                onClick={() => expandCard(render.id)}
                className="inline-flex items-center gap-1 rounded-lg bg-black px-2.5 py-1.5 text-[11px] font-bold text-white"
                data-testid={`library-expand-publish-${render.id}`}
              >
                <Send className="h-3 w-3" />
                Publish
              </button>
            )}
            {expanded && (
              <button
                type="button"
                onClick={() => {
                  setExpandedId(null)
                  setScheduleOpenId(null)
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EDEAE2] px-2.5 py-1.5 text-[11px] font-semibold text-[#888]"
              >
                Close
              </button>
            )}
          </div>
          {expanded && (
            <LibraryPublishPanel
              render={render}
              caption={draft}
              connected={connected}
              selected={platformsFor(render.id)}
              onTogglePlatform={(platform) => {
                const next = toggleLibraryPlatform(platformsFor(render.id), platform)
                setSelectedById((prev) => ({ ...prev, [render.id]: next }))
                if (!libraryAutomaticScheduleAvailable(next, connected)) {
                  setPublishingModeById((prev) => ({ ...prev, [render.id]: 'manual' }))
                }
              }}
              scheduleOpen={scheduleOpenId === render.id}
              onScheduleOpen={(open) => {
                setScheduleOpenId(open ? render.id : null)
                if (open) {
                  const selected = platformsFor(render.id)
                  setPublishingModeById((prev) => ({
                    ...prev,
                    [render.id]:
                      libraryAutomaticScheduleAvailable(selected, connected)
                        ? prev[render.id] ?? 'automatic'
                        : 'manual',
                  }))
                }
              }}
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
              onScheduledDate={setScheduledDate}
              onScheduledTime={setScheduledTime}
              publishingMode={
                publishingModeById[render.id] ??
                (libraryAutomaticScheduleAvailable(platformsFor(render.id), connected)
                  ? 'automatic'
                  : 'manual')
              }
              onPublishingMode={(mode) =>
                setPublishingModeById((prev) => ({ ...prev, [render.id]: mode }))
              }
              submitting={submittingId === render.id}
              error={cardErrors[render.id] || null}
              onPostNow={() => void handlePostNow(render)}
              onSchedule={() => void handleSchedule(render)}
              onDownload={() => void handleDownload(render)}
              onCopy={() => void handleCopyCaption(render)}
            />
          )}
          {!expanded && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => void handleDownload(render)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#888] hover:text-[#333]"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
              {libraryHasSavedCaption(draft) && (
                <button
                  type="button"
                  onClick={() => void handleCopyCaption(render)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#888] hover:text-[#333]"
                >
                  <Copy className="h-3 w-3" />
                  Copy caption
                </button>
              )}
            </div>
          )}
          <p className="mt-1.5 text-[11px] text-[#999]">
            {new Date(render.created_at).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </article>
    )
  }

  const filteredCount = filteredLibraryItems.length
  const isFilteredEmpty =
    libraryItems.length > 0 && filteredCount === 0

  return (
    <>
      <div className="space-y-4 rounded-2xl bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F3ED]/40 p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 px-1">
          <p className="flex min-w-0 flex-1 items-start gap-0.5 text-sm text-[#888]">
            <span>
              {filteredCount} asset{filteredCount === 1 ? '' : 's'}
              {libraryFilter !== 'all' || searchQuery.trim()
                ? ` (of ${libraryItems.length})`
                : ''}{' '}
              - open a card to publish, preview, or download
            </span>
            <InfoGuide topic="library" />
          </p>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setAddMenuOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white hover:bg-[#222]"
              data-testid="library-add-content"
            >
              <Plus className="h-4 w-4" />
              Add content
            </button>
            {addMenuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setAddMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#EDEAE2] bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false)
                      setUploadOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-[#333] hover:bg-[#FAFAF8]"
                    data-testid="library-upload-video"
                  >
                    <Video className="h-4 w-4 text-[#888]" />
                    Upload video
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="relative px-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BBB]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search captions and types…"
            className="w-full rounded-xl border border-[#EDEAE2] bg-white py-2.5 pl-10 pr-10 text-sm text-[#111] placeholder:text-[#AAA] focus:border-[#FFD700] focus:outline-none focus:ring-1 focus:ring-[#FFD700]/40"
            data-testid="library-search"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#AAA] hover:bg-[#FAFAF8] hover:text-[#555]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRADIESPOST_LIBRARY_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setLibraryFilter(id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                libraryFilter === id
                  ? 'bg-[#FFD700] text-black'
                  : 'border border-[#EDEAE2] bg-white text-[#666] hover:border-[#E0DDD5] hover:text-black'
              }`}
              data-testid={`library-filter-${id}`}
            >
              {label}
            </button>
          ))}
        </div>

        {isFilteredEmpty ? (
          <div className="rounded-2xl border border-[#EDEAE2]/80 bg-white p-8 text-center shadow-sm">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-[#E0DDD5]" />
            <p className="mb-1 font-black text-black">No matching assets</p>
            <p className="mb-4 text-sm text-[#888]">
              Try a different filter or search, or create something new.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={createHref}
                className="inline-flex items-center rounded-xl bg-[#FFD700] px-4 py-2 text-sm font-black text-black hover:bg-yellow-400"
              >
                Create
              </a>
              <a
                href={plannerHref}
                className="inline-flex items-center rounded-xl border border-[#EDEAE2] px-4 py-2 text-sm font-bold text-[#555] hover:border-[#FFD700]"
              >
                Planner
              </a>
              <button
                type="button"
                onClick={() => {
                  setLibraryFilter('all')
                  setSearchQuery('')
                }}
                className="inline-flex items-center rounded-xl border border-[#EDEAE2] px-4 py-2 text-sm font-bold text-[#555] hover:border-[#FFD700]"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:gap-4">
            {filteredLibraryItems.map((item) => {
              if (item.mediaKind === 'video') {
                return (
                  <VideoLibraryCard
                    key={item.id}
                    asset={item.asset}
                    businessName={business?.name}
                    videoHeadlineDefaults={{
                      brandColor: business?.brand_color ?? null,
                      socialTextStyles: parseSocialTextStyles(business?.social_text_styles),
                    }}
                    expanded={expandedVideoId === item.id}
                    onExpand={() => {
                      setExpandedVideoId(item.id)
                      setExpandedId(null)
                    }}
                    onCollapse={() => setExpandedVideoId(null)}
                    onDeleted={() => void loadRenders()}
                    onAssetUpdated={(patch) => {
                      setVideos((prev) =>
                        prev.map((row) =>
                          row.id === patch.id ? { ...row, ...patch } : row,
                        ),
                      )
                    }}
                  />
                )
              }
              return renderImageCard(item.render)
            })}
          </div>
        )}
      </div>
      <LibraryVideoUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onComplete={() => void loadRenders()}
      />
    </>
  )
}
