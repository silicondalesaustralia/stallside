'use client'

import {
  rememberPinterestBoard,
  type ComposerPinterestState,
} from '@/components/tradiespost/composer/useComposerPinterest'
import { PINTEREST_TITLE_MAX, defaultPinterestTitle } from '@/lib/social/pinterest/pinterestSettings'

type Props = {
  state: ComposerPinterestState
  caption: string
  username: string | null
}

const FIELD = 'mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal'

export function ComposerPinterestSettings({ state, caption, username }: Props) {
  const { draft, setDraft, boards, boardsError } = state
  const fallbackTitle = defaultPinterestTitle(caption)

  function pickBoard(boardId: string) {
    const board = boards?.find((b) => b.id === boardId)
    setDraft((prev) => ({ ...prev, boardId, boardName: board?.name ?? '' }))
    if (boardId) rememberPinterestBoard(boardId)
  }

  return (
    <div className="space-y-4" data-testid="composer-pinterest-settings">
      {username && (
        <p className="text-sm text-zinc-700">
          Pinning as <strong>@{username}</strong>
        </p>
      )}

      <label className="block text-sm font-bold text-[#18181B]">
        Board
        {boardsError ? (
          <span className="mt-1 block text-sm font-normal text-red-600">{boardsError}</span>
        ) : !boards ? (
          <span className="mt-1 block text-sm font-normal text-zinc-500">Loading your boards…</span>
        ) : boards.length === 0 ? (
          <span className="mt-1 block text-sm font-normal text-zinc-600">
            You have no boards yet. Create one on Pinterest, then come back.
          </span>
        ) : (
          <select value={draft.boardId} onChange={(e) => pickBoard(e.target.value)} className={FIELD} data-testid="pinterest-board">
            <option value="">Pick a board</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.privacy === 'SECRET' ? ' (secret)' : ''}
              </option>
            ))}
          </select>
        )}
      </label>

      <label className="block text-sm font-bold text-[#18181B]">
        Pin title
        <input
          type="text"
          value={draft.title}
          maxLength={PINTEREST_TITLE_MAX}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={fallbackTitle || 'e.g. Fresh sourdough every Saturday'}
          className={FIELD}
          data-testid="pinterest-title"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {draft.title.trim() ? `${draft.title.length}/${PINTEREST_TITLE_MAX}` : 'Leave blank to use the first line of your caption.'}
        </span>
      </label>

      <label className="block text-sm font-bold text-[#18181B]">
        Link (optional)
        <input
          type="url"
          value={draft.link}
          onChange={(e) => setDraft((prev) => ({ ...prev, link: e.target.value }))}
          placeholder="https://your-shop-link"
          className={FIELD}
          data-testid="pinterest-link"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          Where people go when they tap the Pin, like your shop or a product page.
        </span>
      </label>

      <p className="text-xs text-zinc-500">Your caption becomes the Pin description (up to 800 characters).</p>
    </div>
  )
}
