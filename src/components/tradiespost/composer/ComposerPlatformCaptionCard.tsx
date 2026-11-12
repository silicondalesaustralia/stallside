'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'
import { SOCIAL_PUBLISH_PLATFORM_LABELS, type SocialPublishPlatform } from '@/lib/social/libraryPublish'

type Props = {
  platform: SocialPublishPlatform
  /** Short status, e.g. "Custom" or "Uses main caption". */
  status: string
  writing: boolean
  disabled: boolean
  error: string | null
  onWrite: () => void
  children: ReactNode
}

export function ComposerPlatformCaptionCard({ platform, status, writing, disabled, error, onWrite, children }: Props) {
  const [open, setOpen] = useState(false)
  const label = SOCIAL_PUBLISH_PLATFORM_LABELS[platform]

  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white" data-testid={`composer-platform-card-${platform}`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
          <span className="text-sm font-bold text-[#18181B]">{label}</span>
          <span className="truncate text-xs text-zinc-500">{status}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            onWrite()
          }}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#E4E4E7] px-2.5 py-1.5 text-xs font-bold text-[#18181B] disabled:opacity-50"
          data-testid={`composer-write-${platform}`}
        >
          {writing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {writing ? 'Writing…' : 'Write with AI'}
        </button>
      </div>
      {error && <p className="px-3 pb-2 text-xs font-semibold text-red-600">{error}</p>}
      {open && <div className="border-t border-[#E4E4E7] p-3">{children}</div>}
    </div>
  )
}
