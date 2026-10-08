'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  Download,
  Film,
  Loader2,
  Palette,
  Play,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { VideoBrandingPanel } from '@/components/social/VideoBrandingPanel'
import {
  downloadFilenameForVideo,
  formatVideoDuration,
} from '@/lib/social/libraryMediaViewModel'
import { formatRelatedJobLabel } from '@/lib/social/mediaAssetJob'
import type { SocialMediaAssetListItem } from '@/lib/social/mediaAssetTypes'
import { designedCaptionUiState } from '@/lib/social/designedCaptionContext'
import { SOCIAL_VIDEO_ERRORS } from '@/lib/social/videoUploadLimits'
import type { VideoBrandingConfig } from '@/lib/social/videoBranding/types'
import type { VideoHeadlineBusinessDefaults } from '@/lib/social/videoBranding/headlineStyle'

type Props = {
  asset: SocialMediaAssetListItem
  businessName?: string | null
  videoHeadlineDefaults?: VideoHeadlineBusinessDefaults
  expanded: boolean
  onExpand: () => void
  onCollapse: () => void
  onDeleted?: () => void
  onAssetUpdated?: (patch: Partial<SocialMediaAssetListItem> & { id: string }) => void
}

async function downloadVideoUrl(url: string, filename: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function VideoLibraryCard({
  asset,
  businessName,
  videoHeadlineDefaults,
  expanded,
  onExpand,
  onCollapse,
  onDeleted,
  onAssetUpdated,
}: Props) {
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)
  const [captionLoading, setCaptionLoading] = useState(false)
  const [captionDraft, setCaptionDraft] = useState(asset.caption ?? '')
  const [captionDirty, setCaptionDirty] = useState(false)
  const [showBrandingPanel, setShowBrandingPanel] = useState(false)
  const [previewMode, setPreviewMode] = useState<'original' | 'branded'>('original')
  const [processingStatus, setProcessingStatus] = useState(asset.processingStatus)
  const [processedUrl, setProcessedUrl] = useState(asset.processedUrl)
  const [brandingConfig, setBrandingConfig] = useState<VideoBrandingConfig | null>(
    (asset.brandingConfig as VideoBrandingConfig | null) ?? null,
  )

  useEffect(() => {
    setProcessingStatus(asset.processingStatus)
    setProcessedUrl(asset.processedUrl)
    setBrandingConfig((asset.brandingConfig as VideoBrandingConfig | null) ?? null)
  }, [asset.id, asset.processingStatus, asset.processedUrl, asset.brandingConfig])

  const prevProcessedUrl = useRef<string | null>(null)
  useEffect(() => {
    if (processedUrl && processedUrl !== prevProcessedUrl.current && processingStatus === 'processed') {
      setPreviewMode('branded')
      prevProcessedUrl.current = processedUrl
    }
  }, [processedUrl, processingStatus])

  useEffect(() => {
    if (processingStatus !== 'processing') return

    let cancelled = false
    let attempts = 0
    const maxAttempts = 120

    const poll = async () => {
      if (cancelled || attempts >= maxAttempts) return
      attempts += 1
      try {
        const res = await fetch(`/api/social/media-assets/${asset.id}/processing-status`)
        const json = await res.json()
        if (!res.ok || cancelled) return

        const nextStatus = json.processingStatus as SocialMediaAssetListItem['processingStatus']
        setProcessingStatus(nextStatus)
        if (json.processedUrl) setProcessedUrl(json.processedUrl)
        if (json.brandingConfig) setBrandingConfig(json.brandingConfig)

        onAssetUpdated?.({
          id: asset.id,
          processingStatus: nextStatus,
          processedUrl: json.processedUrl ?? null,
          brandingConfig: json.brandingConfig ?? null,
        })

        if (nextStatus === 'processing') {
          window.setTimeout(poll, 4000)
        } else if (nextStatus === 'processed') {
          toast('Branded video ready', 'success')
          setShowBrandingPanel(false)
        } else if (nextStatus === 'processing_failed') {
          toast("We couldn't create the branded video. Try again.", 'error')
        }
      } catch {
        if (!cancelled) window.setTimeout(poll, 4000)
      }
    }

    const timer = window.setTimeout(poll, 4000)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [asset.id, processingStatus, onAssetUpdated, toast])

  useEffect(() => {
    setCaptionDraft(asset.caption ?? '')
    setCaptionDirty(false)
  }, [asset.id, asset.caption])

  const isProcessing = processingStatus === 'processing'
  const hasBranded = processingStatus === 'processed' && Boolean(processedUrl)
  const previewSrc =
    previewMode === 'branded' && processedUrl ? processedUrl : asset.originalUrl
  const caption = captionDirty ? captionDraft : (asset.caption ?? captionDraft)
  const ui = designedCaptionUiState(caption)
  const relatedJobLabel = formatRelatedJobLabel({
    title: asset.jobTitle,
    suburb: asset.jobSuburb,
  })
  const previewText =
    caption.trim() || asset.aboutText?.trim() || ''
  const durationLabel = formatVideoDuration(asset.durationSeconds)
  const hasThumb = !!asset.thumbnailUrl?.trim()

  async function persistCaption(text: string) {
    const res = await fetch(`/api/social/media-assets/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: text }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || 'Could not save caption')
    onAssetUpdated?.({ id: asset.id, caption: text.trim() || null })
  }

  async function handleGenerateCaption() {
    setCaptionLoading(true)
    try {
      const res = await fetch('/api/social/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Caption failed')
      const text = json.captions?.[0]
      if (!text?.trim()) throw new Error('No caption returned')
      setCaptionDraft(text)
      setCaptionDirty(true)
      await persistCaption(text)
      setCaptionDirty(false)
      toast('Caption saved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not generate caption', 'error')
    } finally {
      setCaptionLoading(false)
    }
  }

  async function handleCaptionBlur() {
    if (!captionDirty) return
    const trimmed = captionDraft.trim()
    const saved = asset.caption?.trim() ?? ''
    if (trimmed === saved) {
      setCaptionDirty(false)
      return
    }
    try {
      await persistCaption(trimmed)
      setCaptionDirty(false)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save caption', 'error')
    }
  }

  async function handleCopyCaption() {
    const text = caption.trim()
    if (!text) {
      toast('Generate a caption first', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      toast('Caption copied', 'success')
    } catch {
      toast('Could not copy caption', 'error')
    }
  }

  async function handleDownload(variant: 'original' | 'branded' = 'original') {
    const url =
      variant === 'branded' && processedUrl ? processedUrl : asset.originalUrl
    if (!url) {
      toast('Download unavailable', 'error')
      return
    }
    try {
      const filename = downloadFilenameForVideo(
        businessName,
        asset.mimeType,
        asset.createdAt,
        variant,
      )
      await downloadVideoUrl(url, filename)
      toast(variant === 'branded' ? 'Branded video downloaded' : 'Video downloaded', 'success')
    } catch {
      toast('Download failed', 'error')
    }
  }

  async function handleStartBranding(payload: Record<string, unknown>) {
    const res = await fetch(`/api/social/media-assets/${asset.id}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || 'Could not start branding')
    setProcessingStatus('processing')
    onAssetUpdated?.({ id: asset.id, processingStatus: 'processing' })
    toast('Preparing branded video…', 'success')
  }

  async function handleDelete() {
    if (!window.confirm('Remove this video from your Library?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/social/media-assets/${asset.id}`, {
        method: 'DELETE',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      toast('Video removed', 'success')
      onDeleted?.()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete video', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function handleSaveCaption() {
    const trimmed = captionDraft.trim()
    try {
      await persistCaption(trimmed)
      setCaptionDirty(false)
      toast('Caption saved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save caption', 'error')
    }
  }

  const hasCaption = Boolean(caption.trim())
  const showCaptionSection = expanded || hasCaption || captionLoading
  const brandingReady = asset.status === 'ready'
  const showCollapsedBrandEntry =
    !expanded &&
    brandingReady &&
    !showBrandingPanel &&
    (processingStatus === 'none' ||
      processingStatus === 'processing_failed' ||
      (processingStatus === 'processed' && hasBranded))

  function openBrandingPanel() {
    if (!expanded) onExpand()
    setShowBrandingPanel(true)
  }

  return (
    <article
      className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:mb-4 ${
        expanded ? 'border-[#EDEAE2] ring-1 ring-[#FFD700]/50' : 'border-[#EDEAE2]/80'
      }`}
      data-testid={`library-video-card-${asset.id}`}
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-[#111]">
        {expanded && previewSrc ? (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={previewSrc}
              controls
              preload="metadata"
              playsInline
              className="aspect-video w-full bg-black"
              data-testid={`library-video-player-${asset.id}`}
            />
            {hasBranded ? (
              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('branded')}
                  className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                    previewMode === 'branded'
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-black/60 text-white'
                  }`}
                >
                  Branded
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('original')}
                  className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                    previewMode === 'original'
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-black/60 text-white'
                  }`}
                >
                  Original
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={onCollapse}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80"
              aria-label="Close preview"
              data-testid={`library-video-close-preview-${asset.id}`}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onExpand}
            className="relative block aspect-video w-full"
            aria-label="Play video preview"
          >
            {hasThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.thumbnailUrl!}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[140px] w-full items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
                <Film className="h-10 w-10 text-[#666]" />
              </div>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md">
                <Play className="ml-0.5 h-5 w-5 text-black" fill="currentColor" />
              </span>
            </span>
          </button>
        )}

        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
          <Film className="h-3 w-3" />
          VIDEO
        </span>
        {durationLabel && !expanded ? (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white/95">
            {durationLabel}
          </span>
        ) : null}
        {isProcessing && !expanded ? (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-[#FFD700]/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
            Processing…
          </span>
        ) : null}
        {hasBranded && !expanded ? (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-indigo-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Branded
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-3">
        {!expanded && (
          <p
            className={`text-xs leading-relaxed ${previewText ? 'line-clamp-2 text-[#555]' : 'text-[#BBB]'}`}
          >
            {previewText || 'No caption yet'}
          </p>
        )}

        {showCaptionSection ? (
          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#888]">
              Caption
            </p>

            {captionLoading ? (
              <p className="flex items-center gap-2 text-xs font-medium text-[#886600]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating caption…
              </p>
            ) : null}

            {expanded && ui.showEditor ? (
              <textarea
                value={captionDraft}
                onChange={(e) => {
                  setCaptionDraft(e.target.value)
                  setCaptionDirty(true)
                }}
                onBlur={() => void handleCaptionBlur()}
                rows={3}
                aria-label="Video caption"
                className="w-full resize-y rounded-xl border border-[#EDEAE2] px-3 py-2.5 text-xs leading-relaxed text-[#555] sm:text-sm"
                data-testid={`library-video-caption-editor-${asset.id}`}
              />
            ) : null}

            {!hasCaption && !captionLoading && ui.showGenerate ? (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!expanded) onExpand()
                    void handleGenerateCaption()
                  }}
                  disabled={captionLoading}
                  title="Creates a social caption using your description, related job and business details."
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#FFD700] px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
                  data-testid={`library-video-generate-caption-${asset.id}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate caption
                </button>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#999]">
                  Creates a social caption using your description, related job and business
                  details.
                </p>
              </div>
            ) : null}

            {(hasCaption || captionDirty) && !captionLoading ? (
              <div className="flex flex-wrap gap-2">
                {captionDirty ? (
                  <button
                    type="button"
                    onClick={() => void handleSaveCaption()}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-black px-3 py-2 text-xs font-bold text-white"
                    data-testid={`library-video-save-caption-${asset.id}`}
                  >
                    Save caption
                  </button>
                ) : null}
                {ui.showRegenerate ? (
                  <button
                    type="button"
                    onClick={() => void handleGenerateCaption()}
                    disabled={captionLoading}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555] disabled:opacity-50"
                    data-testid={`library-video-regenerate-caption-${asset.id}`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                ) : null}
                {ui.showCopy ? (
                  <button
                    type="button"
                    onClick={() => void handleCopyCaption()}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {expanded && brandingReady ? (
          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#888]">
              Branding
            </p>

            {isProcessing ? (
              <p className="flex items-center gap-2 text-xs font-medium text-[#886600]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing…
              </p>
            ) : null}

            {processingStatus === 'processing_failed' ? (
              <p className="text-xs font-medium text-red-600">
                We couldn&apos;t create the branded video. Try again.
              </p>
            ) : null}

            {hasBranded && !showBrandingPanel ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBrandingPanel(true)
                    if (!expanded) onExpand()
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555]"
                  data-testid={`library-video-edit-branding-${asset.id}`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  Edit branding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMode('branded')
                    if (!expanded) onExpand()
                    else onExpand()
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555]"
                >
                  <Play className="h-3.5 w-3.5" />
                  Preview branded video
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload('branded')}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-black px-3 py-2 text-xs font-bold text-white"
                  data-testid={`library-video-download-branded-${asset.id}`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download branded video
                </button>
              </div>
            ) : null}

            {processingStatus === 'processing_failed' && !showBrandingPanel ? (
              <button
                type="button"
                onClick={openBrandingPanel}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#EDEAE2] bg-white px-3 py-2 text-xs font-semibold text-[#555]"
                data-testid={`library-video-retry-brand-${asset.id}`}
              >
                <Palette className="h-3.5 w-3.5" />
                Retry branding
              </button>
            ) : null}

            {!hasBranded && !isProcessing && !showBrandingPanel && processingStatus !== 'processing_failed' ? (
              <button
                type="button"
                onClick={() => setShowBrandingPanel(true)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#EDEAE2] bg-white px-3 py-2 text-xs font-semibold text-[#555]"
                data-testid={`library-video-brand-${asset.id}`}
              >
                <Palette className="h-3.5 w-3.5" />
                Brand video
              </button>
            ) : null}

            {showBrandingPanel ? (
              <VideoBrandingPanel
                assetId={asset.id}
                initialConfig={brandingConfig}
                previewImageUrl={asset.thumbnailUrl}
                businessDefaults={videoHeadlineDefaults}
                processing={isProcessing}
                suggestContext={{
                  aboutText: asset.aboutText,
                  jobTitle: asset.jobTitle,
                  jobSuburb: asset.jobSuburb,
                }}
                onSubmit={handleStartBranding}
                onClose={() => setShowBrandingPanel(false)}
              />
            ) : null}
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-[#F3F1EB] pt-3">
          {!expanded ? (
            <button
              type="button"
              onClick={onExpand}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555]"
            >
              <Play className="h-3.5 w-3.5" />
              Preview
            </button>
          ) : null}
          {showCollapsedBrandEntry ? (
            <button
              type="button"
              onClick={openBrandingPanel}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800"
              data-testid={
                hasBranded
                  ? `library-video-edit-branding-collapsed-${asset.id}`
                  : processingStatus === 'processing_failed'
                    ? `library-video-retry-brand-collapsed-${asset.id}`
                    : `library-video-brand-collapsed-${asset.id}`
              }
            >
              <Palette className="h-3.5 w-3.5" />
              {hasBranded
                ? 'Edit branding'
                : processingStatus === 'processing_failed'
                  ? 'Retry branding'
                  : 'Brand video'}
            </button>
          ) : null}
          {!expanded && isProcessing ? (
            <span
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] px-3 py-2 text-xs font-semibold text-[#886600]"
              data-testid={`library-video-processing-collapsed-${asset.id}`}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing…
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void handleDownload(hasBranded ? 'branded' : 'original')}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555]"
          >
            <Download className="h-3.5 w-3.5" />
            {hasBranded ? 'Download branded' : 'Download'}
          </button>
          {hasBranded ? (
            <button
              type="button"
              onClick={() => void handleDownload('original')}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#EDEAE2] px-3 py-2 text-xs font-semibold text-[#555]"
              data-testid={`library-video-download-original-${asset.id}`}
            >
              <Download className="h-3.5 w-3.5" />
              Download original
            </button>
          ) : null}
        </div>

        <div className="border-t border-[#F3F1EB] pt-2">
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
            data-testid={`library-video-delete-${asset.id}`}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete video
          </button>
        </div>

        {relatedJobLabel ? (
          <p className="text-[10px] text-[#AAA]">
            <span className="font-semibold uppercase tracking-wide">Related job</span>
            <span className="mt-0.5 block text-[11px] font-normal normal-case tracking-normal text-[#777]">
              {relatedJobLabel}
            </span>
          </p>
        ) : null}

        <p className="text-[10px] text-[#BBB]">
          {new Date(asset.createdAt).toLocaleDateString('en-AU', {
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

export function useVideoFileMetadata(file: File | null) {
  const [duration, setDuration] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setDuration(null)
      setPreviewUrl(null)
      setError(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setError(null)
    setDuration(null)

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url

    const onLoaded = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        setError(SOCIAL_VIDEO_ERRORS.finalizeFailed)
        return
      }
      setDuration(video.duration)
    }
    const onError = () => setError(SOCIAL_VIDEO_ERRORS.unsupported)

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('error', onError)

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('error', onError)
      URL.revokeObjectURL(url)
    }
  }, [file])

  return { duration, previewUrl, error }
}

export async function captureVideoThumbnailBlob(
  file: File,
  durationSeconds: number,
): Promise<Blob | null> {
  const url = URL.createObjectURL(file)
  try {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = url

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('metadata'))
    })

    const seekTo = Math.min(Math.max(durationSeconds * 0.15, 0.5), Math.max(durationSeconds - 0.1, 0.5))
    video.currentTime = seekTo

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve()
      video.onerror = () => reject(new Error('seek'))
    })

    const maxW = 640
    const scale = video.videoWidth > maxW ? maxW / video.videoWidth : 1
    const w = Math.max(1, Math.round(video.videoWidth * scale))
    const h = Math.max(1, Math.round(video.videoHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', 0.85)
    })
    return blob
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function uploadFileWithProgress(
  signedUrl: string,
  file: Blob,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error('upload failed'))
    }
    xhr.onerror = () => reject(new Error('upload failed'))
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.send(file)
  })
}

export function validateVideoFileClient(file: File): string | null {
  const allowed = new Set(['video/mp4', 'video/quicktime'])
  if (!allowed.has(file.type)) {
    return SOCIAL_VIDEO_ERRORS.unsupported
  }
  if (file.size > 250 * 1024 * 1024) {
    return SOCIAL_VIDEO_ERRORS.tooLarge
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
