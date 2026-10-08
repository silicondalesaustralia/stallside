'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles, Upload } from 'lucide-react'
import type { StockPhoto } from '@/lib/social/stockPhotos'
import { AiPhotoGenerator } from '@/components/social/AiPhotoGenerator'
import { ImageExpandTrigger } from '@/components/ui/ClickToExpandImage'
import type { AiImagePurpose } from '@/lib/social/aiImageStyles'
import { formatPhotoCleanupCreditLine } from '@/lib/social/composeCreditEstimate'
import type { PhotoSource } from '@/lib/social/composeModel'
import { LibraryPhotoPicker } from '@/components/social/LibraryPhotoPicker'
import { readApiJson } from '@/lib/http/readApiJson'
import { isCanonicalHttpsPhotoUrl } from '@/lib/social/uploadInspirationTempFile'

interface JobPhoto {
  id:        string
  url:       string
  webp_url:  string | null
}

export function PhotoFieldPicker({
  label,
  selectedUrl,
  canonicalUrl,
  onSelect,
  jobPhotos,
  photosLoading,
  selectedJobId,
  uploading,
  onUpload,
  tradeCategory,
  jobDescription,
  brandColor,
  businessName,
  aiSessionKey,
  photoSource,
  derivedPurpose,
  onAiPhotoGenerated,
  onCleanupApplied,
}: {
  label:           string
  selectedUrl:     string
  /** HTTPS URL for AI endpoints. Never a blob/data/file preview. */
  canonicalUrl?:   string
  onSelect:        (url: string) => void
  jobPhotos:       JobPhoto[]
  photosLoading:   boolean
  selectedJobId:   string
  uploading:       boolean
  onUpload:        (file: File) => void
  tradeCategory:   string
  jobDescription:  string
  brandColor:      string | null
  businessName:    string
  aiSessionKey:    number
  /** Drives which picker panel renders - matches Step 2 photo source axis. */
  photoSource:     Exclude<PhotoSource, 'none'>
  derivedPurpose:  AiImagePurpose
  onAiPhotoGenerated?: () => void
  onCleanupApplied?:   () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockPhotos, setStockPhotos] = useState<StockPhoto[]>([])
  const [stockLoading, setStockLoading] = useState(false)
  const [stockError, setStockError] = useState<string | null>(null)
  const [rehostingId, setRehostingId] = useState<string | null>(null)
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [cleanupEnabled, setCleanupEnabled] = useState(false)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [cleanupError, setCleanupError] = useState<string | null>(null)
  const [cleanupDone, setCleanupDone] = useState(false)

  const enhancePhotoUrl = isCanonicalHttpsPhotoUrl(canonicalUrl)
    ? String(canonicalUrl).trim()
    : isCanonicalHttpsPhotoUrl(selectedUrl)
      ? selectedUrl.trim()
      : ''

  const showCleanup =
    photoSource === 'upload' ||
    photoSource === 'job' ||
    photoSource === 'unsplash' ||
    photoSource === 'pexels' ||
    photoSource === 'library'

  useEffect(() => {
    setCleanupEnabled(false)
    setCleanupError(null)
    setCleanupDone(false)
  }, [photoSource, selectedUrl])

  async function runPhotoCleanup() {
    if (cleanupLoading || uploading) return
    const photoUrl = enhancePhotoUrl
    if (!isCanonicalHttpsPhotoUrl(photoUrl)) {
      setCleanupError(
        uploading
          ? 'Uploading photo…'
          : 'Wait for the photo to finish uploading before enhancing.',
      )
      return
    }
    setCleanupLoading(true)
    setCleanupError(null)
    try {
      const res = await fetch('/api/social/photo-cleanup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ photoUrl }),
      })
      const json = await readApiJson<{ cleanedUrl?: string; code?: string; error?: string }>(res)
      if (!res.ok || !json.cleanedUrl || !isCanonicalHttpsPhotoUrl(json.cleanedUrl)) {
        if (json.code === 'no_render_credits') {
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || 'Enhancement failed')
      }
      onSelect(json.cleanedUrl)
      setCleanupDone(true)
      onCleanupApplied?.()
    } catch (err) {
      setCleanupError(err instanceof Error ? err.message : 'Enhancement failed')
    } finally {
      setCleanupLoading(false)
    }
  }

  const fetchStockPhotos = useCallback(async (source: 'unsplash' | 'pexels', query: string) => {
    if (query.trim().length < 2) {
      setStockPhotos([])
      setStockError(null)
      return
    }

    setStockLoading(true)
    setStockError(null)
    try {
      const res = await fetch(
        `/api/social/stock-photos/${source}?query=${encodeURIComponent(query.trim())}`,
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Search failed')
      setStockPhotos(json.photos ?? [])
    } catch (err) {
      setStockPhotos([])
      setStockError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setStockLoading(false)
    }
  }, [])

  useEffect(() => {
    if (photoSource !== 'unsplash' && photoSource !== 'pexels') return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchStockPhotos(photoSource, searchQuery)
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [photoSource, searchQuery, fetchStockPhotos])

  useEffect(() => {
    setSearchQuery('')
    setStockPhotos([])
    setStockError(null)
    setSelectedStockId(null)
  }, [photoSource])

  function trackUnsplashDownload(photoId: string) {
    fetch('/api/social/stock-photos/unsplash/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ photoId }),
    }).catch(() => {})
  }

  async function handleStockSelect(photo: StockPhoto) {
    if (rehostingId) return

    if (photo.source === 'unsplash') {
      trackUnsplashDownload(photo.id)
    }

    setRehostingId(photo.id)
    setStockError(null)
    try {
      const res = await fetch('/api/social/stock-photos/rehost', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: photo.fullUrl }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Failed to save stock photo')
      }
      setSelectedStockId(photo.id)
      onSelect(json.url as string)
    } catch (err) {
      setStockError(err instanceof Error ? err.message : 'Failed to save stock photo')
    } finally {
      setRehostingId(null)
    }
  }

  function handleJobSelect(url: string) {
    setSelectedStockId(null)
    onSelect(url)
  }

  const stockLabel = photoSource === 'unsplash' ? 'Unsplash' : 'Pexels'

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#666]">{label}</label>

      {photoSource === 'job' && (
        <>
          {selectedJobId && photosLoading && (
            <p className="mb-2 text-xs text-[#888] flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading photos…
            </p>
          )}
          {selectedJobId && !photosLoading && jobPhotos.length === 0 && (
            <p className="mb-2 text-xs text-[#888]">No photos for this item</p>
          )}
          {jobPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {jobPhotos.map((p) => {
                const url = p.webp_url || p.url
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleJobSelect(url)}
                    className={`group relative h-16 w-16 rounded-lg overflow-hidden border-2 ${
                      selectedUrl === url
                        ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40'
                        : 'border-[#EDEAE2] hover:border-[#CCC]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <ImageExpandTrigger src={url} alt="Product photo" />
                  </button>
                )
              })}
            </div>
          )}
          {!selectedJobId ? (
            <p className="mb-2 text-xs text-[#888]">Choose a product or offer to see its photos, or switch photo source to Upload.</p>
          ) : null}
        </>
      )}

      {photoSource === 'upload' && (
        <>
          {selectedUrl.trim() ? (
            <div
              className="relative mb-2 h-28 w-28 overflow-hidden rounded-lg border-2 border-[#FFD700] ring-2 ring-[#FFD700]/40"
              data-testid="compose-uploaded-photo-preview"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedUrl} alt="Your uploaded photo" className="h-full w-full object-cover" />
              <ImageExpandTrigger src={selectedUrl} alt="Your uploaded photo" />
            </div>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setSelectedStockId(null)
                onUpload(f)
              }
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-dashed border-[#CCC] px-3 py-2 text-xs font-semibold text-[#666] hover:border-[#FFD700]"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {selectedUrl.trim() ? 'Replace photo' : 'Upload photo'}
          </button>
          <p className="mt-1 text-[10px] text-[#999]">JPG, PNG or WebP. Max 4 MB.</p>
        </>
      )}

      {(photoSource === 'unsplash' || photoSource === 'pexels') && (
        <>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${stockLabel}…`}
            className="mb-2 w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          />
          {searchQuery.trim().length < 2 && (
            <p className="text-xs text-[#888]">Type at least 2 characters to search</p>
          )}
          {stockLoading && (
            <p className="text-xs text-[#888] flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Searching…
            </p>
          )}
          {stockError && (
            <p className="text-xs text-red-600">{stockError}</p>
          )}
          {!stockLoading && searchQuery.trim().length >= 2 && stockPhotos.length === 0 && !stockError && (
            <p className="text-xs text-[#888]">No results</p>
          )}
          {stockPhotos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {stockPhotos.map((photo) => (
                <div key={photo.id} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={!!rehostingId}
                    onClick={() => handleStockSelect(photo)}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedStockId === photo.id
                        ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40'
                        : 'border-[#EDEAE2] hover:border-[#CCC]'
                    } ${rehostingId && rehostingId !== photo.id ? 'opacity-50' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <ImageExpandTrigger
                      src={photo.thumbnailUrl}
                      expandSrc={photo.fullUrl}
                      alt="Stock photo"
                    />
                    {rehostingId === photo.id && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </span>
                    )}
                  </button>
                  {photoSource === 'unsplash' && photo.photographerUrl && (
                    <p className="text-[9px] leading-tight text-[#999] px-0.5">
                      <a
                        href={photo.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#666] underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {photo.photographerName}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {photoSource === 'ai_generate' && (
        <AiPhotoGenerator
          variant="guided"
          derivedPurpose={derivedPurpose}
          selectedUrl={selectedUrl}
          onPhotoSelect={(url) => {
            setSelectedStockId(null)
            onSelect(url)
          }}
          onPhotoGenerated={onAiPhotoGenerated}
          businessName={businessName}
          tradeCategory={tradeCategory}
          jobDescription={jobDescription}
          brandColor={brandColor}
          sessionKey={aiSessionKey}
        />
      )}

      {photoSource === 'custom_prompt' && (
        <AiPhotoGenerator
          variant="custom"
          derivedPurpose={derivedPurpose}
          selectedUrl={selectedUrl}
          onPhotoSelect={(url) => {
            setSelectedStockId(null)
            onSelect(url)
          }}
          onPhotoGenerated={onAiPhotoGenerated}
          businessName={businessName}
          tradeCategory={tradeCategory}
          jobDescription={jobDescription}
          brandColor={brandColor}
          sessionKey={aiSessionKey}
        />
      )}

      {photoSource === 'library' && (
        <LibraryPhotoPicker
          selectedUrl={selectedUrl}
          onSelect={(url) => {
            setSelectedStockId(null)
            onSelect(url)
          }}
        />
      )}

      {showCleanup && selectedUrl.trim() && (
        <div className="mt-3 rounded-lg border border-[#EDEAE2] bg-[#FAFAF8] p-3 space-y-2">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={cleanupEnabled}
              disabled={cleanupLoading || cleanupDone}
              onChange={(e) => setCleanupEnabled(e.target.checked)}
              className="mt-0.5 accent-[#FFD700]"
            />
            <span className="text-xs text-[#444]">
              <span className="font-semibold">AI Clean Up</span>
              {' - '}Let AI enhance this photo (lighting, clarity, remove clutter). Preserves the subject - enhancement only.
            </span>
          </label>
          {cleanupEnabled && !cleanupDone && (
            <>
              <button
                type="button"
                disabled={cleanupLoading || uploading || !enhancePhotoUrl}
                onClick={runPhotoCleanup}
                data-testid="compose-enhance-photo"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-xs font-black text-black hover:border-[#FFD700] disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading photo…
                  </>
                ) : cleanupLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Enhancing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Enhance photo
                  </>
                )}
              </button>
              <p className="text-[10px] text-[#888]">{formatPhotoCleanupCreditLine()}</p>
            </>
          )}
          {cleanupDone && (
            <p className="text-[10px] font-semibold text-green-700">Photo enhanced - 1 render credit used.</p>
          )}
          {cleanupError && (
            <p className="text-xs text-red-600">{cleanupError}</p>
          )}
        </div>
      )}
    </div>
  )
}
