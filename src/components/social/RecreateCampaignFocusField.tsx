'use client'

import {
  CAMPAIGN_FOCUS_STARTERS,
  appendCampaignFocusStarter,
} from '@/lib/social/campaignFocusInstructions'
import { CAMPAIGN_FOCUS_MAX_CHARS } from '@/lib/social/normalizeCampaignFocus'
import { InfoGuide } from '@/components/ui/InfoGuide'

const PLACEHOLDER =
  "e.g. Focus this on Victorian Energy Upgrades. Remove the other plumbing services and don't use our business name as the headline. Keep the strong blue layout, but make the offer the main focus."

export function RecreateCampaignFocusField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2 p-4">
      <label htmlFor="recreate-campaign-focus" className="flex items-center gap-0.5 text-sm font-black text-[#111]">
        What should we change or focus on?
        <InfoGuide topic="recreateGuidance" />
      </label>
      <p className="text-[11px] leading-relaxed text-[#888]">
        Tell StitchedUp what to keep, remove, emphasise or change from the inspiration. The more
        specific you are, the better the versions will match what you want.
      </p>
      <p className="text-[11px] font-semibold text-[#666]">For example:</p>
      <div className="flex flex-wrap gap-1.5" data-testid="recreate-focus-starters">
        {CAMPAIGN_FOCUS_STARTERS.map((starter) => (
          <button
            key={starter.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(appendCampaignFocusStarter(value, starter.insert))}
            className="rounded-full border border-[#EDEAE2] bg-[#FAFAF8] px-2.5 py-1 text-[11px] font-semibold text-[#555] hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 disabled:opacity-50"
          >
            {starter.label}
          </button>
        ))}
      </div>
      <textarea
        id="recreate-campaign-focus"
        value={value}
        maxLength={CAMPAIGN_FOCUS_MAX_CHARS}
        rows={4}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value.length > CAMPAIGN_FOCUS_MAX_CHARS) return
          onChange(e.target.value)
        }}
        className="min-h-[120px] w-full resize-y rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm leading-relaxed"
        placeholder={PLACEHOLDER}
        data-testid="recreate-campaign-focus"
      />
      <div className="flex items-center justify-between gap-3 text-[11px] text-[#888]">
        <p>Optional - add as much direction as you need</p>
        <p className="shrink-0 tabular-nums" data-testid="recreate-focus-count">
          {value.length} / {CAMPAIGN_FOCUS_MAX_CHARS}
        </p>
      </div>
    </div>
  )
}
