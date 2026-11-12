'use client'

import type { ComposerYouTubeState } from '@/components/tradiespost/composer/useComposerYouTube'
import {
  YOUTUBE_PRIVACY_LABELS,
  YOUTUBE_PRIVACY_OPTIONS,
  type YouTubePrivacy,
} from '@/lib/social/youtube/youtubeSettings'

type Props = {
  state: ComposerYouTubeState
  channelTitle: string | null
}

export function ComposerYouTubeSettings({ state, channelTitle }: Props) {
  const { draft, setDraft } = state

  return (
    <div className="space-y-4" data-testid="composer-youtube-settings">
      {channelTitle && (
        <p className="text-sm text-zinc-700">
          Posting to YouTube as <strong>{channelTitle}</strong>
        </p>
      )}

      <label className="block text-sm font-bold text-[#18181B]">
        Who can see this video?
        <select
          value={draft.privacy}
          onChange={(e) => setDraft((prev) => ({ ...prev, privacy: e.target.value as YouTubePrivacy }))}
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
          data-testid="youtube-privacy"
        >
          {YOUTUBE_PRIVACY_OPTIONS.map((privacy) => (
            <option key={privacy} value={privacy}>
              {YOUTUBE_PRIVACY_LABELS[privacy]}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-zinc-500">
        Title, description and tags are in step 3 under YouTube. Vertical videos show as YouTube Shorts.
      </p>
    </div>
  )
}
