'use client'

import { useState } from 'react'
import { Loader2, Scissors, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { TradiesPostButtonLight, TradiesPostCard } from '@/components/tradiespost/ui'
import { formatVideoDuration } from '@/lib/social/libraryMediaViewModel'
import { VIDEO_SOURCE_RETENTION_DAYS } from '@/lib/social/videoClips/limits'
import type { VideoSourceListItem } from '@/lib/social/videoClips/types'
import { DEFAULT_CLIP_JOB_OPTIONS, clipJobDurationError, type ClipJobOptions } from '@/lib/social/videoClips/validation'
import { ClipOptionsFields } from './ClipOptionsFields'
import { VideoClipTile } from './VideoClipTile'
import { VideoSourceTitle } from './VideoSourceTitle'
import { VideoSourceEditorButton } from './VideoSourceEditorButton'
import { startClipJob } from './uploadVideoSource'
import { clipJobStatusLabel } from './clipJobStatusLabel'

type Props = { source: VideoSourceListItem; onChanged: () => void }

export function VideoSourceCard({ source, onChanged }: Props) {
  const { toast } = useToast()
  const [showOptions, setShowOptions] = useState(false)
  const [busy, setBusy] = useState(false)
  const [options, setOptions] = useState<ClipJobOptions>(DEFAULT_CLIP_JOB_OPTIONS)

  const job = source.latestJob
  const active = job?.status === 'pending' || job?.status === 'processing'
  const status = clipJobStatusLabel(job)
  const hasFullClip = source.clips.some((c) => c.fullVideo)

  async function handleClip() {
    const durationError = clipJobDurationError(options.clipLength, source.durationSeconds)
    if (durationError) {
      toast(durationError, 'error')
      return
    }
    setBusy(true)
    try {
      await startClipJob(source.id, options)
      setShowOptions(false)
      onChanged()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not start clipping', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this video? Clips already in your Library will be kept.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/social/videos/${source.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || 'Could not delete video')
      }
      onChanged()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete video', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <TradiesPostCard padding="md">
      <div className="flex flex-col gap-4 sm:flex-row">
        {source.previewUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={source.previewUrl} controls preload="metadata" playsInline className="aspect-video w-full rounded-xl bg-black sm:w-64" />
        ) : null}
        <div className="min-w-0 flex-1">
          <VideoSourceTitle sourceId={source.id} title={source.title} onRenamed={onChanged} />
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatVideoDuration(source.durationSeconds)} · uploaded{' '}
            {new Date(source.createdAt).toLocaleDateString('en-AU')}
          </p>
          {source.expired ? (
            <p className="mt-2 text-sm font-semibold text-zinc-500">
              Source video expired after {VIDEO_SOURCE_RETENTION_DAYS} days — clips kept in your Library
            </p>
          ) : null}
          {status ? (
            <p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${status.tone}`}>
              {active ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {status.text}
            </p>
          ) : null}
          {active ? (
            <p className="mt-1 text-xs text-zinc-500">
              Clipping can take a few minutes, longer for big videos. You can close this page and come back later — we’ll keep working and your clips will be saved to your Library.
            </p>
          ) : null}
          {job?.status === 'failed' && job.errorMessage ? (
            <p className="mt-1 break-words text-xs text-zinc-500">Details: {job.errorMessage}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <VideoSourceEditorButton source={source} onChanged={onChanged} />
            <TradiesPostButtonLight size="sm" variant={hasFullClip ? 'ghost' : 'primary'} disabled={busy || active || source.expired} onClick={() => setShowOptions((v) => !v)} iconLeft={<Scissors className="h-3.5 w-3.5" />}>
              {hasFullClip ? 'Make AI clips' : source.clips.length ? 'Make more clips' : 'Make clips or edit'}
            </TradiesPostButtonLight>
            <TradiesPostButtonLight size="sm" variant="ghost" disabled={busy || active} onClick={() => void handleDelete()} iconLeft={<Trash2 className="h-3.5 w-3.5" />}>
              Delete
            </TradiesPostButtonLight>
          </div>
          {showOptions && !active && !source.expired ? (
            <div className="mt-3 space-y-3 rounded-xl bg-zinc-50 p-3">
              <ClipOptionsFields value={options} onChange={setOptions} disabled={busy} />
              <TradiesPostButtonLight size="sm" disabled={busy} onClick={() => void handleClip()}>
                {options.clipLength === 'full' ? 'Prepare for editing' : 'Start clipping'}
              </TradiesPostButtonLight>
            </div>
          ) : null}
        </div>
      </div>
      {source.clips.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {source.clips.map((clip) => (
            <VideoClipTile key={clip.id} clip={clip} onChanged={onChanged} />
          ))}
        </div>
      ) : null}
    </TradiesPostCard>
  )
}
