'use client'

import { Loader2, RefreshCw, Sparkles } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  limit: number
  generating: boolean
  error: string | null
  onWriteForMe: () => void
  onTryAnother: () => void
}

export function ComposerCaptionField({
  value,
  onChange,
  limit,
  generating,
  error,
  onWriteForMe,
  onTryAnother,
}: Props) {
  const over = value.length > limit
  const hasText = Boolean(value.trim())

  return (
    <div data-testid="composer-caption">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        placeholder="What did you do today? Or tap Write for me."
        className="w-full resize-y rounded-xl border border-[#E4E4E7] bg-white p-3 text-sm leading-relaxed text-[#18181B] outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
        data-testid="composer-caption-input"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onWriteForMe}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
          data-testid="composer-write-for-me"
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {generating ? 'Writing…' : 'Write for me'}
        </button>
        {hasText && (
          <button
            type="button"
            onClick={onTryAnother}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-2 text-xs font-bold text-[#18181B] disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try another
          </button>
        )}
        <span className={`ml-auto text-xs tabular-nums ${over ? 'font-bold text-red-600' : 'text-zinc-400'}`}>
          {value.length.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}
