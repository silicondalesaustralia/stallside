'use client'

import type { TikTokSettingsDraft } from '@/lib/social/tiktok/tiktokSettings'

type Props = {
  draft: TikTokSettingsDraft
  isVideo: boolean
  onChange: (patch: Partial<TikTokSettingsDraft>) => void
}

const MUSIC_POLICY = 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en'
const BRANDED_POLICY = 'https://www.tiktok.com/legal/page/global/bc-policy/en'

export function ComposerTikTokDisclosure({ draft, isVideo, onChange }: Props) {
  const noun = isVideo ? 'video' : 'photo'
  const label = draft.brandedContent ? 'Paid partnership' : draft.brandOrganic ? 'Promotional content' : null

  return (
    <div className="space-y-2">
      <label className="flex items-start justify-between gap-3 text-sm font-bold text-[#18181B]">
        <span>
          Disclose post content
          <span className="block text-xs font-normal text-zinc-500">
            Turn on if this {noun} promotes your business or a brand.
          </span>
        </span>
        <input
          type="checkbox"
          checked={draft.discloseCommercial}
          onChange={(e) =>
            onChange({ discloseCommercial: e.target.checked, brandOrganic: false, brandedContent: false })
          }
          className="mt-1 h-4 w-4"
          data-testid="tiktok-disclose"
        />
      </label>

      {draft.discloseCommercial && (
        <div className="space-y-2 rounded-lg bg-[#FAFAFA] p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.brandOrganic}
              onChange={(e) => onChange({ brandOrganic: e.target.checked })}
            />
            <span><strong>Your brand</strong> - you&apos;re promoting yourself or your own business</span>
          </label>
          <label
            className={`flex items-center gap-2 text-sm ${draft.privacyLevel === 'SELF_ONLY' ? 'opacity-50' : ''}`}
            title={draft.privacyLevel === 'SELF_ONLY' ? 'Branded content visibility cannot be set to private.' : undefined}
          >
            <input
              type="checkbox"
              checked={draft.brandedContent}
              disabled={draft.privacyLevel === 'SELF_ONLY'}
              onChange={(e) => onChange({ brandedContent: e.target.checked })}
            />
            <span><strong>Branded content</strong> - you&apos;re promoting another brand or a third party</span>
          </label>
          {label && (
            <p className="text-xs text-zinc-600">
              Your {noun} will be labeled &ldquo;{label}&rdquo;.
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-zinc-500">
        By posting, you agree to TikTok&apos;s{' '}
        {draft.brandedContent && (
          <>
            <a href={BRANDED_POLICY} target="_blank" rel="noopener noreferrer" className="underline">
              Branded Content Policy
            </a>{' '}
            and{' '}
          </>
        )}
        <a href={MUSIC_POLICY} target="_blank" rel="noopener noreferrer" className="underline">
          Music Usage Confirmation
        </a>
        .
      </p>
    </div>
  )
}
