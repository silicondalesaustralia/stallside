'use client'

import { Loader2, Send } from 'lucide-react'

type Props = {
  label: string
  blockReason: string | null
  submitting: boolean
  error: string | null
  onSubmit: () => void
}

export function ComposerSubmitBar({ label, blockReason, submitting, error, onSubmit }: Props) {
  return (
    <div data-testid="composer-submit">
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || Boolean(blockReason)}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#F5C518] px-4 text-sm font-black text-[#18181B] transition-colors hover:bg-[#E6B800] disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="composer-submit-button"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? 'Working…' : label}
      </button>
      {blockReason && !submitting && <p className="mt-2 text-xs text-zinc-500">{blockReason}</p>}
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}
