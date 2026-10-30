'use client'

import type { ComposerYouTubeState } from '@/components/tradiespost/composer/useComposerYouTube'
import {
  YOUTUBE_PRIVACY_LABELS,
  YOUTUBE_PRIVACY_OPTIONS,
  YOUTUBE_TITLE_MAX,
  defaultYouTubeTitle,
  type YouTubePrivacy,
} from '@/lib/social/youtube/youtubeSettings'
import {
  YOUTUBE_TAGS_MAX_CHARS,
  parseYouTubeTags,
  youtubeTagsLength,
} from '@/lib/social/youtube/youtubeTags'

type Props = {
  state: ComposerYouTubeState
  caption: string
  channelTitle: string | null
}

export function ComposerYouTubeSettings({ state, caption, channelTitle }: Props) {
  const { draft, setDraft } = state
  const fallbackTitle = defaultYouTubeTitle(caption)
  const tags = parseYouTubeTags(draft.tags)

  return (
    <div className="space-y-4" data-testid="composer-youtube-settings">
      {channelTitle && (
        <p className="text-sm text-zinc-700">
          Posting to YouTube as <strong>{channelTitle}</strong>
        </p>
      )}

      <label className="block text-sm font-bold text-[#18181B]">
        Video title
        <input
          type="text"
          value={draft.title}
          maxLength={YOUTUBE_TITLE_MAX}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={fallbackTitle || 'e.g. First strawberries of the season'}
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
          data-testid="youtube-title"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {draft.title.trim() ? `${draft.title.length}/${YOUTUBE_TITLE_MAX}` : 'Leave blank to use the first line of your caption.'}
        </span>
      </label>

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

      <label className="block text-sm font-bold text-[#18181B]">
        Tags
        <input
          type="text"
          value={draft.tags}
          onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g. strawberries, farm stand, pick your own"
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
          data-testid="youtube-tags"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {tags.length
            ? `${tags.length} ${tags.length === 1 ? 'tag' : 'tags'} · ${youtubeTagsLength(tags)}/${YOUTUBE_TAGS_MAX_CHARS} characters`
            : 'Optional. Separate tags with commas.'}
        </span>
      </label>

      <p className="text-xs text-zinc-500">
        Your caption becomes the video description. Vertical videos show as YouTube Shorts.
      </p>
    </div>
  )
}
