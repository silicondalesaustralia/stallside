'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { formatFileSize, useVideoFileMetadata } from '@/components/social/VideoLibraryCard'
import { formatVideoDuration } from '@/lib/social/libraryMediaViewModel'
import { DEFAULT_CLIP_JOB_OPTIONS, type ClipJobOptions } from '@/lib/social/videoClips/validation'
import { ClipOptionsFields } from './ClipOptionsFields'
import { uploadAndClipVideo, validateSourceFileClient } from './uploadVideoSource'

type Props = { open: boolean; onClose: () => void; onUploaded: () => void }

const inputClass =
  'w-full rounded-xl border border-tradiespost-border px-3 py-2.5 text-sm text-tradiespost-text disabled:opacity-60'

const LARGE_UPLOAD_BYTES = 100 * 1024 * 1024

export function VideoSourceUploadModal({ open, onClose, onUploaded }: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [options, setOptions] = useState<ClipJobOptions>(DEFAULT_CLIP_JOB_OPTIONS)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const { duration, error: metaError } = useVideoFileMetadata(file)

  if (!open) return null

  const fileError = file ? metaError || validateSourceFileClient(file, duration, options) : null
  const isLarge = !!file && file.size >= LARGE_UPLOAD_BYTES
  const full = options.clipLength === 'full'

  function reset() {
    setFile(null)
    setTitle('')
    setAboutText('')
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose() {
    if (busy) return
    reset()
    onClose()
  }

  async function handleSubmit() {
    if (!file || duration == null || fileError) return
    setBusy(true)
    setProgress(0)
    try {
      await uploadAndClipVideo({ file, durationSeconds: duration, title, aboutText, options, onProgress: setProgress })
      toast(
        full
          ? 'Uploaded — we’re preparing your video. The editor opens when it’s ready, or use “Open in editor” on the video later.'
          : 'Uploaded — we’re finding the best clips now. Feel free to leave and come back later.',
        'success',
      )
      reset()
      onUploaded()
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="video-source-upload-title">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-tradiespost-border px-4 py-3">
          <h2 id="video-source-upload-title" className="text-base font-black text-black">Upload a video</h2>
          <button type="button" onClick={handleClose} disabled={busy} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-4 py-4">
          <input ref={inputRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-tradiespost-border bg-zinc-50 px-4 py-8 text-center hover:border-tradiespost-gold disabled:opacity-60">
            <Upload className="h-7 w-7 text-zinc-500" />
            <span className="text-sm font-bold text-black">{file ? file.name : 'Choose video'}</span>
            <span className="text-xs text-zinc-500">
              {file
                ? `${formatFileSize(file.size)}${duration != null ? ` · ${formatVideoDuration(duration)}` : ''}`
                : 'MP4 or MOV · up to 30 minutes · max 1 GB'}
            </span>
          </button>
          {fileError ? <p className="text-sm font-semibold text-red-600">{fileError}</p> : null}
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} disabled={busy} placeholder="Title (optional) — e.g. Strawberry picking day" />
          <ClipOptionsFields value={options} onChange={setOptions} disabled={busy} />
          {full ? null : (
            <textarea className={inputClass} value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={2} maxLength={2000} disabled={busy} placeholder="What’s in the video? Helps us pick the best moments (optional)" />
          )}
          {file && !busy && !fileError && isLarge ? (
            <p className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              This is a large file ({formatFileSize(file.size)}) — uploading may take a few minutes depending on your connection.
              <span className="mt-1 block">
                Tip: filming at 1080p instead of 4K makes videos about 4× smaller and much quicker to upload — your clips come out at 1080p either way.
              </span>
            </p>
          ) : null}
          {busy ? (
            <div className="rounded-xl bg-tradiespost-gold/10 px-3 py-3 text-sm font-semibold text-zinc-700">
              {progress >= 100 ? 'Finishing up — preparing your video…' : `Uploading… ${progress}%`}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full rounded-full bg-tradiespost-gold transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs font-normal text-zinc-600">
                {isLarge ? 'Large videos can take a few minutes to upload. ' : ''}Please keep this window open until it’s done.
              </p>
            </div>
          ) : null}
        </div>
        <div className="border-t border-tradiespost-border px-4 py-3">
          <button type="button" onClick={() => void handleSubmit()} disabled={!file || busy || duration == null || !!fileError} className="flex w-full items-center justify-center gap-2 rounded-xl bg-tradiespost-gold py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {full ? 'Upload video' : <>Upload &amp; make clips</>}
          </button>
        </div>
      </div>
    </div>
  )
}
