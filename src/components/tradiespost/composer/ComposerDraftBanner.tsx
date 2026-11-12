'use client'

import { History, X } from 'lucide-react'

type Props = {
  restored: 'local' | 'saved' | null
  onStartFresh: () => void
  onDismiss: () => void
}

/** Tells the user their work came back after a refresh (or a saved draft opened), with a way out. */
export function ComposerDraftBanner({ restored, onStartFresh, onDismiss }: Props) {
  if (!restored) return null
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#F5C518] bg-[#FFF8DB] px-4 py-3" data-testid="composer-draft-banner">
      <History className="h-4 w-4 shrink-0 text-[#886600]" />
      <p className="flex-1 text-sm font-semibold text-[#18181B]">
        {restored === 'saved' ? 'Opened your saved draft.' : 'We brought back the post you were working on.'}
      </p>
      <button type="button" onClick={onStartFresh} className="text-sm font-bold text-[#886600] underline">
        Start fresh
      </button>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-zinc-500 hover:text-zinc-800">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
