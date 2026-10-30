'use client'

import type { ReactNode } from 'react'
import { ArrowLeftToLine, ArrowRightToLine, Combine, MessageSquarePlus, RotateCcw, Scissors, SplitSquareHorizontal, Trash2, Type, Volume2, VolumeX } from 'lucide-react'
import {
  audioMutesFrom,
  audioPartsFrom,
  isAudioMutedAt,
  splitAudioAt,
  toggleAudioMuteAt,
  type AudioPart,
} from '@/lib/social/videoClips/audioEdits'
import type { CaptionCue } from '@/lib/social/videoClips/captionCues'
import { fullSegments, isFullClip, type ClipSegment } from '@/lib/social/videoClips/timeline'
import {
  addCueAt,
  deleteSegmentAt,
  mergeCueWithNext,
  splitCueAt,
  splitSegmentsAt,
  trimSegmentsAt,
} from '@/lib/social/videoClips/timelineEdits'

type Props = {
  time: number
  duration: number
  segments: ClipSegment[]
  cues: CaptionCue[]
  activeIndex: number
  disabled?: boolean
  onSegments: (next: ClipSegment[]) => void
  onCues: (next: CaptionCue[]) => void
  audioParts: AudioPart[]
  onAudioParts: (next: AudioPart[]) => void
  onAddText: () => void
}

type Action = { label: string; icon: ReactNode; result: unknown[] | null; apply: () => void }

function ToolButton({ action, disabled }: { action: Action; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={action.apply}
      disabled={disabled || !action.result}
      className="flex items-center gap-1.5 rounded-lg border border-tradiespost-border px-2.5 py-1.5 text-xs font-bold text-tradiespost-text hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {action.icon}
      {action.label}
    </button>
  )
}

/** Edit actions applied at the playhead. */
export function ClipEditorToolbar(props: Props) {
  const { time, duration, segments, cues, activeIndex, disabled, onSegments, onCues, onAddText, audioParts } = props
  const seg = (label: string, icon: ReactNode, result: ClipSegment[] | null): Action => ({
    label,
    icon,
    result,
    apply: () => result && onSegments(result),
  })
  const cue = (label: string, icon: ReactNode, result: CaptionCue[] | null): Action => ({
    label,
    icon,
    result,
    apply: () => result && onCues(result),
  })
  const icon = 'h-3.5 w-3.5'

  const videoActions = [
    seg('Split', <Scissors className={icon} aria-hidden />, splitSegmentsAt(segments, time)),
    seg('Delete section', <Trash2 className={icon} aria-hidden />, deleteSegmentAt(segments, time)),
    seg('Trim start', <ArrowLeftToLine className={icon} aria-hidden />, trimSegmentsAt(segments, time, 'start')),
    seg('Trim end', <ArrowRightToLine className={icon} aria-hidden />, trimSegmentsAt(segments, time, 'end')),
    seg('Restore', <RotateCcw className={icon} aria-hidden />, isFullClip(segments, duration) ? null : fullSegments(duration)),
  ]
  const captionActions = [
    cue('Split caption', <SplitSquareHorizontal className={icon} aria-hidden />, splitCueAt(cues, activeIndex, time)),
    cue('Merge with next', <Combine className={icon} aria-hidden />, mergeCueWithNext(cues, activeIndex)),
    cue('Add caption', <MessageSquarePlus className={icon} aria-hidden />, addCueAt(cues, time, duration)),
  ]
  const voice = (label: string, node: ReactNode, result: AudioPart[] | null): Action => ({
    label,
    icon: node,
    result,
    apply: () => result && props.onAudioParts(result),
  })
  const muted = isAudioMutedAt(audioParts, time)
  const voiceActions = [
    voice('Split voice', <Scissors className={icon} aria-hidden />, splitAudioAt(audioParts, time)),
    muted
      ? voice('Unmute section', <Volume2 className={icon} aria-hidden />, toggleAudioMuteAt(audioParts, time))
      : voice('Mute section', <VolumeX className={icon} aria-hidden />, toggleAudioMuteAt(audioParts, time)),
    voice(
      'Restore voice',
      <RotateCcw className={icon} aria-hidden />,
      audioParts.length > 1 || audioMutesFrom(audioParts).length ? audioPartsFrom([], duration) : null,
    ),
  ]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-14 text-[11px] font-bold uppercase text-zinc-400">Video</span>
        {videoActions.map((a) => <ToolButton key={a.label} action={a} disabled={disabled} />)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-14 text-[11px] font-bold uppercase text-zinc-400">Voice</span>
        {voiceActions.map((a) => <ToolButton key={a.label} action={a} disabled={disabled} />)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-14 text-[11px] font-bold uppercase text-zinc-400">Captions</span>
        {captionActions.map((a) => <ToolButton key={a.label} action={a} disabled={disabled} />)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-14 text-[11px] font-bold uppercase text-zinc-400">Text</span>
        <ToolButton
          action={{ label: 'Add text', icon: <Type className={icon} aria-hidden />, result: [], apply: onAddText }}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
