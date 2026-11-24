'use client'

import { MoveHorizontal, Plus } from 'lucide-react'

type Props = {
  disabled?: boolean
  canAdd: boolean
  onAdd: () => void
  canFill: boolean
  onFill: () => void
}

const BUTTON =
  'flex items-center gap-1.5 rounded-lg border border-tradiespost-border px-2.5 py-1.5 text-xs font-bold text-tradiespost-text hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40'

/** Blur tool row for the clip / Library editors. */
export function ClipBlurTools({ disabled, canAdd, onAdd, canFill, onFill }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-14 text-[11px] font-bold uppercase text-zinc-400">Blur</span>
      <button type="button" onClick={onAdd} disabled={disabled || !canAdd} className={BUTTON}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add blur
      </button>
      <button type="button" onClick={onFill} disabled={disabled || !canFill} className={BUTTON}>
        <MoveHorizontal className="h-3.5 w-3.5" aria-hidden />
        Selected blur: full length
      </button>
    </div>
  )
}
