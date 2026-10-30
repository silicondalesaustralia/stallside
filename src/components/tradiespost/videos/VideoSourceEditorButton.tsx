'use client'

import { useEffect, useRef, useState } from 'react'
import { Scissors } from 'lucide-react'
import { TradiesPostButtonLight } from '@/components/tradiespost/ui'
import type { VideoSourceListItem } from '@/lib/social/videoClips/types'
import { ClipEditorModal } from './ClipEditorModal'

type Props = { source: VideoSourceListItem; onChanged: () => void }

/**
 * "Open in editor" for a video uploaded with "Use whole video". Opens on its own
 * when preparation finishes while the page is open.
 */
export function VideoSourceEditorButton({ source, onChanged }: Props) {
  const [editing, setEditing] = useState(false)
  const job = source.latestJob
  const preparing = job?.clipLength === 'full' && (job.status === 'pending' || job.status === 'processing')
  const fullClip = source.clips.find((c) => c.fullVideo) ?? null
  const wasPreparing = useRef(preparing)

  useEffect(() => {
    if (wasPreparing.current && !preparing && job?.status === 'completed' && fullClip) setEditing(true)
    wasPreparing.current = preparing
  }, [preparing, job?.status, fullClip])

  if (!fullClip) return null
  const updating = fullClip.captionJobStatus === 'pending' || fullClip.captionJobStatus === 'processing'

  return (
    <>
      <TradiesPostButtonLight
        size="sm"
        variant="primary"
        disabled={updating}
        onClick={() => setEditing(true)}
        iconLeft={<Scissors className="h-3.5 w-3.5" />}
      >
        {updating ? 'Saving edits…' : 'Open in editor'}
      </TradiesPostButtonLight>
      {editing ? (
        <ClipEditorModal
          clipId={fullClip.id}
          clipTitle={fullClip.title || source.title || 'Video'}
          onClose={() => setEditing(false)}
          onSaved={onChanged}
        />
      ) : null}
    </>
  )
}
