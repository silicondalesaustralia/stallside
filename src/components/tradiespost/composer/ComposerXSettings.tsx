'use client'

import type { ComposerXState } from '@/components/tradiespost/composer/useComposerX'
import { X_TEXT_MAX, xTextLength } from '@/lib/social/x/xText'

type Props = {
  state: ComposerXState
  username: string | null
}

export function ComposerXSettings({ state, username }: Props) {
  const length = xTextLength(state.text)
  const over = length > X_TEXT_MAX

  return (
    <div className="space-y-3" data-testid="composer-x-settings">
      {username && (
        <p className="text-sm text-zinc-700">
          Posting as <strong>@{username}</strong>
        </p>
      )}
      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="x-text" className="text-sm font-bold text-[#18181B]">Post text for X</label>
          {state.touched && (
            <button type="button" onClick={state.resetText} className="text-xs font-bold text-[#18181B] underline">
              Use my caption
            </button>
          )}
        </div>
        <textarea
          id="x-text"
          rows={4}
          value={state.text}
          onChange={(e) => state.setText(e.target.value)}
          placeholder="Your caption, shortened to fit X"
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm"
          data-testid="x-text"
        />
        <span className={`mt-1 block text-xs ${over ? 'font-semibold text-red-600' : 'text-zinc-500'}`}>
          {length}/{X_TEXT_MAX}. Links count as 23 characters.
        </span>
      </div>
      <p className="text-xs text-zinc-500">
        X allows {X_TEXT_MAX} characters, so we start from your caption and shorten it if needed. One photo is attached.
      </p>
    </div>
  )
}
