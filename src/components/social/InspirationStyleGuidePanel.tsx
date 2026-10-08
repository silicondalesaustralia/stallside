'use client'

import type { InspirationComposePrefill } from '@/lib/social/inspirationTypes'

const VISUAL_STYLE_LABELS: Record<InspirationComposePrefill['hints']['visualStyle'], string> = {
  photo_led: 'Photo-led',
  graphic_led: 'Graphic-led',
  mixed: 'Mixed photo + graphic',
}

export function InspirationStyleGuidePanel({
  prefill,
}: {
  prefill: InspirationComposePrefill
}) {
  const { hints, matchedLabel } = prefill
  const { theme } = hints

  return (
    <div
      className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm"
      data-testid="inspiration-style-guide"
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
        Style guide
      </p>
      <p className="mt-1 text-sm font-black text-[#111]">{matchedLabel}</p>
      <p className="mt-2 text-xs text-[#666] leading-relaxed">
        Here&apos;s what we read from your reference - this drives the variants below.
      </p>

      <dl className="mt-4 space-y-3 text-xs">
        <div>
          <dt className="font-semibold text-[#888]">Theme</dt>
          <dd className="mt-0.5 text-[#333] leading-relaxed">{theme.themeSummary}</dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[#888]">Tone</dt>
            <dd className="mt-0.5 text-[#333]">{theme.tone}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#888]">Subject</dt>
            <dd className="mt-0.5 text-[#333]">{theme.subjectCategory}</dd>
          </div>
        </div>
        <div className="border-t border-[#F0EDE5] pt-3">
          <dt className="font-semibold text-[#888]">Layout read</dt>
          <dd className="mt-1 text-[#555] leading-relaxed">
            {VISUAL_STYLE_LABELS[hints.visualStyle]} · {hints.layoutOrientation} · ~
            {hints.contentBlockCount} block{hints.contentBlockCount === 1 ? '' : 's'} · headline
            ~{hints.headlineMaxChars} chars
          </dd>
        </div>
      </dl>
    </div>
  )
}
