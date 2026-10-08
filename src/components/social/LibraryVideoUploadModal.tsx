'use client'

import { useRef, useState } from 'react'
import { Film, Loader2, Upload, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  captureVideoThumbnailBlob,
  formatFileSize,
  uploadFileWithProgress,
  useVideoFileMetadata,
  validateVideoFileClient,
} from '@/components/social/VideoLibraryCard'
import { SocialJobPicker } from '@/components/social/SocialJobPicker'
import { formatVideoDuration } from '@/lib/social/libraryMediaViewModel'
import { SOCIAL_VIDEO_ERRORS } from '@/lib/social/videoUploadLimits'

type UploadPhase = 'idle' | 'uploading' | 'preparing' | 'done'

type Props = {
  open: boolean
  onClose: () => void
  onComplete: () => void
  onViewLibrary?: () => void
}

export function LibraryVideoUploadModal({
  open,
  onClose,
  onComplete,
  onViewLibrary,
}: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [aboutText, setAboutText] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [progress, setProgress] = useState(0)
  const { duration, previewUrl, error: metaError } = useVideoFileMetadata(file)

  if (!open) return null

  function resetForm() {
    setFile(null)
    setAboutText('')
    setJobId(null)
    setPhase('idle')
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose() {
    if (phase === 'uploading' || phase === 'preparing') return
    resetForm()
    onClose()
  }

  function handleUploadAnother() {
    resetForm()
  }

  function handleViewLibrary() {
    resetForm()
    onClose()
    onViewLibrary?.()
  }

  function handleFileChange(next: File | null) {
    if (!next) {
      setFile(null)
      return
    }
    const clientErr = validateVideoFileClient(next)
    if (clientErr) {
      toast(clientErr, 'error')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setFile(next)
    setPhase('idle')
    setProgress(0)
  }

  async function handleSubmit() {
    if (!file) return

    if (metaError) {
      toast(metaError, 'error')
      return
    }

    if (duration != null && duration > 60) {
      toast(SOCIAL_VIDEO_ERRORS.tooLong, 'error')
      return
    }

    setPhase('uploading')
    setProgress(0)

    try {
      const urlRes = await fetch('/api/social/media-assets/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mimeType: file.type,
          size: file.size,
          aboutText: aboutText.trim() || undefined,
          jobId: jobId || undefined,
        }),
      })
      const urlJson = await urlRes.json().catch(() => ({}))
      if (!urlRes.ok) {
        throw new Error(urlJson.error || SOCIAL_VIDEO_ERRORS.uploadFailed)
      }

      const assetId = urlJson.assetId as string
      const signedUrl = urlJson.signedUrl as string
      if (!assetId || !signedUrl) {
        throw new Error(SOCIAL_VIDEO_ERRORS.uploadFailed)
      }

      await uploadFileWithProgress(signedUrl, file, file.type, setProgress)

      setPhase('preparing')
      setProgress(0)

      let hasThumbnail = false
      const thumbBlob =
        duration != null ? await captureVideoThumbnailBlob(file, duration) : null

      if (thumbBlob) {
        const thumbRes = await fetch(
          `/api/social/media-assets/${assetId}/thumbnail-upload-url`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ size: thumbBlob.size }),
          },
        )
        const thumbJson = await thumbRes.json().catch(() => ({}))
        if (thumbRes.ok && thumbJson.signedUrl) {
          await uploadFileWithProgress(
            thumbJson.signedUrl as string,
            thumbBlob,
            'image/webp',
          )
          hasThumbnail = true
        }
      }

      const finalizeRes = await fetch(`/api/social/media-assets/${assetId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationSeconds: duration,
          hasThumbnail,
        }),
      })
      const finalizeJson = await finalizeRes.json().catch(() => ({}))
      if (!finalizeRes.ok) {
        throw new Error(finalizeJson.error || SOCIAL_VIDEO_ERRORS.finalizeFailed)
      }

      setPhase('done')
      onComplete()
    } catch (err) {
      toast(
        err instanceof Error ? err.message : SOCIAL_VIDEO_ERRORS.uploadFailed,
        'error',
      )
      setPhase('idle')
      setProgress(0)
    }
  }

  const busy = phase === 'uploading' || phase === 'preparing'
  const durationTooLong = duration != null && duration > 60

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-video-upload-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#EDEAE2] px-4 py-3">
          <h2 id="library-video-upload-title" className="text-base font-black text-black">
            Upload video
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="rounded-lg p-2 text-[#888] hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === 'done' ? (
          <div className="px-4 py-8 text-center">
            <p className="text-lg font-black text-black">Video added to your Library</p>
            <p className="mt-2 text-sm text-[#666]">
              Generate a caption, download, or come back to it anytime from Library.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              {onViewLibrary ? (
                <button
                  type="button"
                  onClick={handleViewLibrary}
                  className="min-h-[44px] rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-black text-black hover:bg-yellow-400"
                  data-testid="video-upload-view-library"
                >
                  View in Library
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleUploadAnother}
                className="min-h-[44px] rounded-xl border border-[#EDEAE2] px-5 py-3 text-sm font-semibold text-[#555] hover:bg-[#FAFAF8]"
                data-testid="video-upload-another"
              >
                Upload another
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto px-4 py-4">
              <p className="mb-4 text-sm text-[#666]">
                Upload an MP4 or MOV video up to 60 seconds. We&apos;ll add it to your Library
                ready for captions, download and social posting.
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,.mp4,.mov"
                className="sr-only"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />

              {!file ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#EDEAE2] bg-[#FAFAF8] px-4 py-10 text-center transition hover:border-[#FFD700] hover:bg-[#FFFBEA]"
                >
                  <Upload className="h-8 w-8 text-[#888]" />
                  <span className="text-sm font-bold text-black">Choose video</span>
                  <span className="text-xs text-[#888]">MP4 or MOV · max 60 sec · max 250 MB</span>
                </button>
              ) : (
                <div className="space-y-3 rounded-2xl border border-[#EDEAE2] bg-[#FAFAF8] p-3">
                  <div className="flex items-start gap-3">
                    <Film className="mt-0.5 h-5 w-5 shrink-0 text-[#888]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-black">{file.name}</p>
                      <p className="text-xs text-[#888]">{formatFileSize(file.size)}</p>
                      {duration != null ? (
                        <p
                          className={`text-xs font-semibold ${durationTooLong ? 'text-red-600' : 'text-[#666]'}`}
                        >
                          Duration: {formatVideoDuration(duration)}
                          {durationTooLong ? ' - too long' : ''}
                        </p>
                      ) : (
                        <p className="text-xs text-[#888]">Reading duration…</p>
                      )}
                    </div>
                    {!busy && (
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="shrink-0 rounded-lg p-1.5 text-[#888] hover:bg-white"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {previewUrl ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      src={previewUrl}
                      controls
                      preload="metadata"
                      playsInline
                      className="aspect-video w-full rounded-xl bg-black"
                    />
                  ) : null}
                </div>
              )}

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold text-[#666]">
                  What is this video about?{' '}
                  <span className="font-normal text-[#AAA]">(optional)</span>
                </span>
                <p className="mb-1.5 text-xs text-[#888]">
                  Add a short description so StitchedUp knows what the post should focus on.
                </p>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  disabled={busy}
                  placeholder="New heat pump installation completed in Brighton."
                  className="w-full resize-y rounded-xl border border-[#EDEAE2] px-3 py-2.5 text-sm text-[#444] disabled:opacity-60"
                />
              </label>

              <div className="mt-4">
                <SocialJobPicker value={jobId} onChange={setJobId} disabled={busy} />
              </div>

              {phase === 'uploading' ? (
                <div className="mt-4 rounded-xl bg-[#FFFBEA] px-3 py-3">
                  <p className="text-sm font-semibold text-[#886600]">
                    Uploading… {progress > 0 ? `${progress}%` : ''}
                  </p>
                  {progress > 0 ? (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EDEAE2]">
                      <div
                        className="h-full rounded-full bg-[#FFD700] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {phase === 'preparing' ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFFBEA] px-3 py-3 text-sm font-semibold text-[#886600]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing…
                </div>
              ) : null}
            </div>

            <div className="border-t border-[#EDEAE2] px-4 py-3">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!file || busy || !!metaError || duration == null || durationTooLong}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Add to Library
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
