'use client'

import type { ComposerYouTubeState } from '@/components/tradiespost/composer/useComposerYouTube'
import { YOUTUBE_TITLE_MAX, defaultYouTubeTitle } from '@/lib/social/youtube/youtubeSettings'
import { YOUTUBE_TAGS_MAX_CHARS, parseYouTubeTags, youtubeTagsLength } from '@/lib/social/youtube/youtubeTags'

const FIELD = 'mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal'

type Props = {
  state: ComposerYouTubeState
  /** YouTube's description (its own caption or the main one), for the default title. */
  description: string
}

export function ComposerYouTubeTextFields({ state, description }: Props) {
  const { draft, setDraft } = state
  const fallbackTitle = defaultYouTubeTitle(description)
  const tags = parseYouTubeTags(draft.tags)

  return (
    <>
      <label className="block text-sm font-bold text-[#18181B]">
        Video title
        <input
          type="text"
          value={draft.title}
          maxLength={YOUTUBE_TITLE_MAX}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={fallbackTitle || 'e.g. First strawberries of the season'}
          className={FIELD}
          data-testid="youtube-title"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {draft.title.trim() ? `${draft.title.length}/${YOUTUBE_TITLE_MAX}` : 'Leave blank to use the first line of the description.'}
        </span>
      </label>
      <label className="block text-sm font-bold text-[#18181B]">
        Tags
        <input
          type="text"
          value={draft.tags}
          onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g. strawberries, farm stand, pick your own"
          className={FIELD}
          data-testid="youtube-tags"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {tags.length
            ? `${tags.length} ${tags.length === 1 ? 'tag' : 'tags'} · ${youtubeTagsLength(tags)}/${YOUTUBE_TAGS_MAX_CHARS} characters`
            : 'Optional. Separate tags with commas.'}
        </span>
      </label>
    </>
  )
}
