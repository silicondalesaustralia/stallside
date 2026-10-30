'use client'

import { useState } from 'react'
import { Copy, Film, Loader2, Scissors } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { formatVideoDuration } from '@/lib/social/libraryMediaViewModel'
import type { VideoClipListItem } from '@/lib/social/videoClips/types'
import { ClipActionsMenu } from './ClipActionsMenu'
import { ClipEditorModal } from './ClipEditorModal'
import { copyClipScript } from './clipScriptExport'

type Props = { clip: VideoClipListItem; onChanged: () => void }

const tileButtonClass =
  'flex items-center justify-center gap-1.5 rounded-lg border border-tradiespost-border py-1.5 text-xs font-bold text-tradiespost-text hover:bg-zinc-50 disabled:opacity-50'

export function VideoClipTile({ clip, onChanged }: Props) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [copying, setCopying] = useState(false)
  const updating = clip.captionJobStatus === 'pending' || clip.captionJobStatus === 'processing'

  async function copyScript() {
    setCopying(true)
    try {
      await copyClipScript(clip.id)
      toast('Script copied', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not copy the script', 'error')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="rounded-xl border border-tradiespost-border bg-white">
      <div className="relative aspect-[9/16] max-h-56 w-full overflow-hidden rounded-t-xl bg-black">
        {clip.originalUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={clip.originalUrl}
            src={clip.originalUrl}
            poster={clip.thumbnailUrl ?? undefined}
            controls
            preload="none"
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-6 w-6 text-zinc-500" aria-hidden />
          </div>
        )}
        {updating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xs font-semibold text-white">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Updating clip…
          </div>
        ) : null}
      </div>
      <div className="px-2.5 py-2">
        <div className="flex items-start gap-1.5">
          <p className="line-clamp-2 min-w-0 flex-1 text-xs font-bold text-tradiespost-text">
            {clip.title || 'Clip'}
          </p>
          <ClipActionsMenu clipId={clip.id} downloadUrl={clip.originalUrl} disabled={updating} onEdit={() => setEditing(true)} />
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          {formatVideoDuration(clip.durationSeconds)}
          {clip.score != null ? ` · Score ${clip.score}` : ''}
        </p>
        {clip.captionJobStatus === 'failed' ? (
          <p className="mt-1 text-[11px] font-semibold text-red-600">Clip update failed — try again</p>
        ) : null}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button type="button" disabled={updating} onClick={() => setEditing(true)} className={tileButtonClass}>
            <Scissors className="h-3.5 w-3.5" aria-hidden />
            Edit
          </button>
          <button type="button" disabled={copying} onClick={() => void copyScript()} className={tileButtonClass}>
            {copying ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
            Copy script
          </button>
        </div>
      </div>
      {editing ? (
        <ClipEditorModal
          clipId={clip.id}
          clipTitle={clip.title || 'Clip'}
          onClose={() => setEditing(false)}
          onSaved={onChanged}
        />
      ) : null}
    </div>
  )
}
