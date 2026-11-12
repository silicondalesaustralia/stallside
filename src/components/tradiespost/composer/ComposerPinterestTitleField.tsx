'use client'

import type { ComposerPinterestState } from '@/components/tradiespost/composer/useComposerPinterest'
import { PINTEREST_TITLE_MAX, defaultPinterestTitle } from '@/lib/social/pinterest/pinterestSettings'

type Props = {
  state: ComposerPinterestState
  /** Pinterest's description (its own caption or the main one), for the default title. */
  description: string
}

export function ComposerPinterestTitleField({ state, description }: Props) {
  const { draft, setDraft } = state
  const fallbackTitle = defaultPinterestTitle(description)

  return (
    <label className="block text-sm font-bold text-[#18181B]">
      Pin title
      <input
        type="text"
        value={draft.title}
        maxLength={PINTEREST_TITLE_MAX}
        onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
        placeholder={fallbackTitle || 'e.g. Fresh sourdough every Saturday'}
        className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
        data-testid="pinterest-title"
      />
      <span className="mt-1 block text-xs font-normal text-zinc-500">
        {draft.title.trim() ? `${draft.title.length}/${PINTEREST_TITLE_MAX}` : 'Leave blank to use the first line of the description.'}
      </span>
    </label>
  )
}
