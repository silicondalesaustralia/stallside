'use client'

import { Loader2 } from 'lucide-react'
import { ComposerTikTokDisclosure } from '@/components/tradiespost/composer/ComposerTikTokDisclosure'
import type { ComposerTikTokState } from '@/components/tradiespost/composer/useComposerTikTok'
import {
  TIKTOK_PRIVACY_LABELS,
  isTikTokPrivacyLevel,
  type TikTokSettingsDraft,
} from '@/lib/social/tiktok/tiktokSettings'

type Props = {
  state: ComposerTikTokState
  isVideo: boolean
  videoDurationSeconds: number | null
}

export function ComposerTikTokSettings({ state, isVideo, videoDurationSeconds }: Props) {
  const { creator, loading, error, draft, setDraft } = state
  const patch = (p: Partial<TikTokSettingsDraft>) => setDraft((prev) => ({ ...prev, ...p }))

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading your TikTok account…
      </p>
    )
  }
  if (error || !creator) {
    return <p className="text-xs font-semibold text-red-600">{error || 'TikTok account unavailable.'}</p>
  }

  const tooLong = isVideo && videoDurationSeconds != null && videoDurationSeconds > creator.maxVideoPostDurationSec
  const toggles: { key: 'disableComment' | 'disableDuet' | 'disableStitch'; label: string; locked: boolean }[] = [
    { key: 'disableComment', label: 'Allow comments', locked: creator.commentDisabled },
    ...(isVideo
      ? [
          { key: 'disableDuet' as const, label: 'Allow Duet', locked: creator.duetDisabled },
          { key: 'disableStitch' as const, label: 'Allow Stitch', locked: creator.stitchDisabled },
        ]
      : []),
  ]

  return (
    <div className="space-y-4" data-testid="composer-tiktok-settings">
      <div className="flex items-center gap-2">
        {creator.creatorAvatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.creatorAvatarUrl} alt="" className="h-8 w-8 rounded-full" />
        )}
        <p className="text-sm text-zinc-700">
          Posting to TikTok as <strong>{creator.creatorNickname || creator.creatorUsername}</strong>
        </p>
      </div>

      {tooLong && (
        <p className="text-xs font-semibold text-red-600">
          This video is longer than TikTok allows for your account ({creator.maxVideoPostDurationSec}s).
        </p>
      )}

      <label className="block text-sm font-bold text-[#18181B]">
        Who can see this post?
        <select
          value={draft.privacyLevel ?? ''}
          onChange={(e) => {
            const value = e.target.value
            patch({ privacyLevel: isTikTokPrivacyLevel(value) ? value : null })
          }}
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
          data-testid="tiktok-privacy"
        >
          <option value="" disabled>
            Choose who can see it
          </option>
          {creator.privacyLevelOptions.map((level) => (
            <option
              key={level}
              value={level}
              disabled={level === 'SELF_ONLY' && draft.brandedContent}
            >
              {TIKTOK_PRIVACY_LABELS[level]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-4">
        {toggles.map(({ key, label, locked }) => (
          <label key={key} className={`flex items-center gap-2 text-sm ${locked ? 'opacity-50' : ''}`}>
            <input
              type="checkbox"
              checked={!locked && !draft[key]}
              disabled={locked}
              onChange={(e) => patch({ [key]: !e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      {!isVideo && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5" checked={draft.autoAddMusic} onChange={(e) => patch({ autoAddMusic: e.target.checked })} />
          <span>
            <span className="font-bold text-[#18181B]">Let TikTok add music</span>
            <span className="block text-xs text-zinc-500">TikTok picks a recommended sound for your slides. Apps can&apos;t choose a specific song.</span>
          </span>
        </label>
      )}

      <ComposerTikTokDisclosure draft={draft} isVideo={isVideo} onChange={patch} />

      <p className="text-xs text-zinc-500">
        After posting, TikTok can take a few minutes to process your post before it appears on your profile.
      </p>
    </div>
  )
}
