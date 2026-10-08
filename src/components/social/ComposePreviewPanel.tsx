'use client'

import { RenderCreditsBalanceWidget } from '@/components/renders/RenderCreditsBalanceWidget'
import type { RenderCreditsSummary } from '@/lib/renders/renderCreditsTypes'
import type { ContentFormat } from '@/lib/social/composeModel'
import {
  FORMAT_ACCENTS,
  PLATFORM_PREVIEW_THEMES,
  type PreviewPlatform,
} from '@/lib/social/socialDesignTokens'

export function ComposePreviewPanel({
  platform,
  contentFormat,
  imageUrl,
  renderId,
  credits,
  creditsLoading,
  creditsPulseKey,
}: {
  platform: PreviewPlatform
  contentFormat: ContentFormat
  imageUrl: string | null
  renderId: string | null
  credits: RenderCreditsSummary | null
  creditsLoading: boolean
  creditsPulseKey: number
}) {
  const platformTheme = PLATFORM_PREVIEW_THEMES[platform]
  const formatAccent = FORMAT_ACCENTS[contentFormat]
  const FormatIcon = formatAccent.Icon

  return (
    <div className="lg:sticky lg:top-6 h-fit">
      <div className="relative rounded-2xl border border-[#EDEAE2]/80 bg-white shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <div
          className={`pointer-events-none absolute right-0 top-0 h-24 w-24 bg-gradient-to-bl ${platformTheme.cornerGradient} opacity-[0.18]`}
          aria-hidden
        />

        <div className={`relative border-b border-[#F0EDE5]/80 px-4 py-3.5 ${platformTheme.headerTint}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-widest text-[#777]">Preview</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${platformTheme.badgeBg} ${platformTheme.badgeText}`}
            >
              {platformTheme.label}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#999]">
            Sized for {platformTheme.label} ·{' '}
            <span className={`inline-flex items-center gap-1 font-semibold ${formatAccent.badgeIcon}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${formatAccent.dot}`} />
              {formatAccent.label}
            </span>
          </p>
        </div>

        <RenderCreditsBalanceWidget
          credits={credits}
          loading={creditsLoading}
          pulseKey={creditsPulseKey}
        />

        <div className="relative p-4">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Generated post"
              className="w-full rounded-xl border border-[#EDEAE2] shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-[#F7F5EF] to-[#EFEBE3] border border-dashed border-[#D8D4CC]">
              <div className="text-center px-4">
                <div
                  className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${formatAccent.badgeBg}`}
                >
                  <FormatIcon className={`h-7 w-7 ${formatAccent.badgeIcon}`} strokeWidth={2.25} />
                </div>
                <p className="text-sm font-medium text-[#999]">Your branded image appears here</p>
                <p className="mt-1 text-[11px] text-[#BBB]">Live preview after you generate</p>
              </div>
            </div>
          )}
          {renderId && (
            <p className="mt-2 text-[10px] text-[#CCC] font-mono truncate">Render {renderId.slice(0, 8)}…</p>
          )}
        </div>
      </div>
    </div>
  )
}
