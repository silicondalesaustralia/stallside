'use client'

import { FACEBOOK_HEADLINE_MAX } from '@/lib/tradiespost/composer/composerState'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function ComposerHeadlineField({ value, onChange }: Props) {
  return (
    <div className="mb-3" data-testid="composer-headline">
      <label htmlFor="composer-headline-input" className="mb-1.5 block text-xs font-semibold text-zinc-600">
        Facebook headline <span className="font-normal text-zinc-400">(optional, Facebook only)</span>
      </label>
      <input
        id="composer-headline-input"
        type="text"
        value={value}
        maxLength={FACEBOOK_HEADLINE_MAX}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Hot water system replaced in Parramatta"
        className="w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2.5 text-sm font-semibold text-[#18181B] outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
      />
      <p className="mt-1 text-[11px] text-zinc-400">
        Shown as the first line of your Facebook post. Instagram and Google get the caption only.
      </p>
    </div>
  )
}
