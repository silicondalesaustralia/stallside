'use client'

import { Captions, Loader2 } from 'lucide-react'
import { ClipBlurTools } from '@/components/tradiespost/videos/ClipBlurTools'

type Props = {
  disabled?: boolean
  canAddBlur: boolean
  onAddBlur: () => void
  canFillBlur: boolean
  onFillBlur: () => void
  hasTranscript: boolean
  transcribing: boolean
  startingCaptions: boolean
  onGenerateCaptions: () => void
}

const BUTTON =
  'flex items-center gap-1.5 rounded-lg border border-tradiespost-border px-2.5 py-1.5 text-xs font-bold text-tradiespost-text hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40'

/** Library-only tool rows under the clip editor toolbar: blur areas and auto captions. */
export function LibraryEditorTools(props: Props) {
  const { disabled, transcribing, startingCaptions } = props
  const captionLabel = transcribing
    ? 'Making captions…'
    : props.hasTranscript
      ? 'Redo auto captions (1 credit)'
      : 'Auto captions (1 credit)'
  return (
    <>
      <ClipBlurTools
        disabled={disabled}
        canAdd={props.canAddBlur}
        onAdd={props.onAddBlur}
        canFill={props.canFillBlur}
        onFill={props.onFillBlur}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-14 text-[11px] font-bold uppercase text-zinc-400">Auto</span>
        <button
          type="button"
          onClick={props.onGenerateCaptions}
          disabled={disabled || transcribing || startingCaptions}
          className={BUTTON}
        >
          {transcribing || startingCaptions ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Captions className="h-3.5 w-3.5" aria-hidden />
          )}
          {captionLabel}
        </button>
      </div>
    </>
  )
}
