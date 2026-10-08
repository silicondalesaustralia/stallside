'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, Link2, Loader2, Sparkles, Upload } from 'lucide-react'
import type { InspirationComposePrefill } from '@/lib/social/inspirationTypes'
import type { CreativeDirection } from '@/lib/social/creativeDirection'
import {
  INSPIRATION_NO_MATCH_MESSAGE,
  INSPIRATION_VIDEO_THUMBNAIL_MESSAGE,
} from '@/lib/social/inspirationTypes'
import { readApiJson } from '@/lib/http/readApiJson'
import { resolveInspirationUploadMime } from '@/lib/social/inspirationUploadMime'
import {
  META_SOCIAL_PREVIEW_MESSAGE,
  isMetaSocialPostUrl,
} from '@/lib/social/metaSocialUrls'
import {
  createInspirationObjectUrl,
  revokeInspirationPreviewSrc,
} from '@/lib/social/inspirationPreview'

const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024

type AnalyzeResponse =
  | {
      ok: true
      prefill: InspirationComposePrefill
      storagePath?: string
      referenceRecreateEnabled?: boolean
      creativeDirection?: CreativeDirection
    }
  | { ok: false; message?: string; needsScreenshot?: boolean; error?: string; detail?: string }
  | { error: string; detail?: string }

export type InspirationAnalyzeExtras = {
  referenceRecreateEnabled?: boolean
  creativeDirection?: CreativeDirection
  /** Local blob/data URL of the uploaded screenshot - not a stored copy. */
  previewSrc?: string | null
}

type UploadUrlResponse =
  | { ok: true; signedUrl: string; path: string }
  | { error: string }

function fileToBase64(file: File, mimeType: string): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'))
        return
      }
      const comma = result.indexOf(',')
      const base64 = comma >= 0 ? result.slice(comma + 1) : result
      if (!base64) {
        reject(new Error('Invalid image file'))
        return
      }
      resolve({ mimeType, base64 })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function uploadScreenshotViaSignedUrl(file: File): Promise<string> {
  const urlRes = await fetch('/api/social/inspiration-analyze/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: file.type, size: file.size }),
  })
  const urlJson = await readApiJson<UploadUrlResponse>(urlRes)
  if (!urlRes.ok || !('signedUrl' in urlJson) || !urlJson.signedUrl || !urlJson.path) {
    const errBody = urlJson as { error?: string }
    throw new Error(errBody.error || 'Could not prepare upload')
  }

  const putRes = await fetch(urlJson.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!putRes.ok) {
    throw new Error('Could not upload screenshot. Please try again.')
  }
  return urlJson.path
}

function isNoMatchMessage(message: string): boolean {
  return (
    message === INSPIRATION_NO_MATCH_MESSAGE ||
    message === INSPIRATION_VIDEO_THUMBNAIL_MESSAGE ||
    message.toLowerCase().includes('try start from scratch') ||
    message.toLowerCase().includes('compose from scratch')
  )
}

export function InspirationEntryPanel({
  onPrefill,
  onAnalysisFailed,
  onSwitchToScratch,
  onCarryPhoto,
}: {
  onPrefill: (
    prefill: InspirationComposePrefill,
    storagePath?: string | null,
    extras?: InspirationAnalyzeExtras,
  ) => void
  onAnalysisFailed?: (message: string, carryPhoto?: { base64: string; mimeType: string }) => void
  onSwitchToScratch?: () => void
  onCarryPhoto?: (payload: { base64: string; mimeType: string }) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastUploadRef = useRef<{ base64: string; mimeType: string } | null>(null)
  const pendingPreviewRef = useRef<string | null>(null)
  const [mode, setMode] = useState<'url' | 'upload'>('upload')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = useCallback(
    async (payload: { url?: string; storagePath?: string; mimeType?: string }) => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/social/inspiration-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await readApiJson<AnalyzeResponse>(res)

        if (!res.ok) {
          const errBody = json as { error?: string; detail?: string }
          throw new Error(errBody.error || 'Analysis failed')
        }

        if ('needsScreenshot' in json && json.needsScreenshot) {
          const fail = json as Extract<AnalyzeResponse, { needsScreenshot?: boolean }>
          setMode('upload')
          setError(
            fail.message ||
              'Could not load a preview from that link - upload a screenshot of the post instead.',
          )
          return
        }

        if (!('ok' in json) || !json.ok || !('prefill' in json) || !json.prefill) {
          const fail = json as Extract<AnalyzeResponse, { ok: false }>
          const message = fail.message || INSPIRATION_NO_MATCH_MESSAGE
          setError(message)
          revokeInspirationPreviewSrc(pendingPreviewRef.current)
          pendingPreviewRef.current = null
          onAnalysisFailed?.(message, lastUploadRef.current ?? undefined)
          return
        }

        const previewSrc = pendingPreviewRef.current
        pendingPreviewRef.current = null
        onPrefill(json.prefill, 'storagePath' in json ? json.storagePath : undefined, {
          referenceRecreateEnabled: json.referenceRecreateEnabled,
          creativeDirection: json.creativeDirection,
          previewSrc,
        })
        setUrl('')
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed'
        setError(message)
        revokeInspirationPreviewSrc(pendingPreviewRef.current)
        pendingPreviewRef.current = null
        onAnalysisFailed?.(message, lastUploadRef.current ?? undefined)
      } finally {
        setLoading(false)
      }
    },
    [onPrefill, onAnalysisFailed],
  )

  useEffect(() => {
    return () => {
      revokeInspirationPreviewSrc(pendingPreviewRef.current)
      pendingPreviewRef.current = null
    }
  }, [])

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Paste a link to the post')
      return
    }
    lastUploadRef.current = null
    revokeInspirationPreviewSrc(pendingPreviewRef.current)
    pendingPreviewRef.current = null
    if (isMetaSocialPostUrl(trimmed)) {
      setMode('upload')
      setError(META_SOCIAL_PREVIEW_MESSAGE)
      return
    }
    await runAnalysis({ url: trimmed })
  }

  async function handleFile(file: File | null) {
    if (!file) return
    const mimeType = resolveInspirationUploadMime(file)
    if (!mimeType) {
      setError('Upload an image file (PNG, JPG, or WebP)')
      return
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError('Image must be under 4 MB')
      return
    }
    try {
      setLoading(true)
      setError(null)
      revokeInspirationPreviewSrc(pendingPreviewRef.current)
      pendingPreviewRef.current = createInspirationObjectUrl(file)
      const { base64 } = await fileToBase64(file, mimeType)
      lastUploadRef.current = { base64, mimeType }
      onCarryPhoto?.({ base64, mimeType })
      const storagePath = await uploadScreenshotViaSignedUrl(
        new File([file], file.name, { type: mimeType }),
      )
      await runAnalysis({ storagePath, mimeType })
    } catch (err) {
      revokeInspirationPreviewSrc(pendingPreviewRef.current)
      pendingPreviewRef.current = null
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to read image')
    }
  }

  const showSwitchToScratch = Boolean(error && onSwitchToScratch && isNoMatchMessage(error))

  return (
    <div
      className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-[#FAFAF8] p-4"
      data-testid="inspiration-entry-panel"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
          <Sparkles className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-sm font-black text-[#111]">Recreate from inspiration</h2>
          <p className="mt-0.5 text-xs text-[#666] leading-relaxed">
            Upload a post you like. We&apos;ll use its creative direction to make something
            original for your business. Your reference is used temporarily to generate the post
            and is then deleted.
          </p>
        </div>
      </div>

      <div className="mb-3 flex gap-1 rounded-lg border border-[#EDEAE2] bg-white p-0.5">
        <button
          type="button"
          onClick={() => {
            setMode('upload')
            setError(null)
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'upload'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-[#888] hover:text-[#444]'
          }`}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Screenshot
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('url')
            setError(null)
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'url'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-[#888] hover:text-[#444]'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          Post URL
        </button>
      </div>

      {mode === 'url' ? (
        <div>
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="min-w-0 flex-1 rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyse
          </button>
        </form>
          <p className="mt-2 text-[11px] leading-relaxed text-[#888]">
            Best for websites and blogs that expose a public preview image. Instagram and
            Facebook cannot be loaded this way until Meta is connected - use Screenshot.
          </p>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-200 bg-white px-4 py-6 text-sm text-[#666] transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            ) : (
              <Upload className="h-6 w-6 text-indigo-400" />
            )}
            <span>
              {loading ? 'Analysing…' : 'Click to upload a screenshot'}
            </span>
            <span className="text-[10px] text-[#AAA]">PNG, JPG, or WebP · max 4 MB · deleted after generation</span>
          </button>
        </div>
      )}

      {error && (
        <div
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          <p>{error}</p>
          {showSwitchToScratch && (
            <button
              type="button"
              onClick={onSwitchToScratch}
              className="mt-2 font-semibold text-indigo-700 underline hover:text-indigo-900"
            >
              Switch to Start from scratch
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** @deprecated Use InspirationStyleGuidePanel in Recreate tab */
export function InspirationHintsBanner({
  matchedLabel,
  hints,
  onDismiss,
}: {
  matchedLabel: string
  hints: InspirationComposePrefill['hints']
  onDismiss: () => void
}) {
  return (
    <div
      className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3.5 py-3"
      data-testid="inspiration-hints-banner"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black text-indigo-900">
            Matched: {matchedLabel}
          </p>
          <p className="mt-1 text-[11px] text-indigo-800/90 leading-relaxed">
            {hints.theme.themeSummary} · {hints.visualStyle === 'photo_led' ? 'photo-led' : hints.visualStyle === 'mixed' ? 'mixed' : 'graphic-led'}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-[10px] font-semibold text-indigo-600 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
