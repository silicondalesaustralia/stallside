'use client'

import { CLIP_COUNT_DEFAULT, CLIP_COUNT_MAX, CLIP_COUNT_MIN } from '@/lib/social/videoClips/limits'
import type { ClipJobOptions } from '@/lib/social/videoClips/validation'
import { CaptionStyleFields } from './CaptionStyleFields'

type Props = {
  value: ClipJobOptions
  onChange: (next: ClipJobOptions) => void
  disabled?: boolean
}

const selectClass =
  'w-full rounded-xl border border-tradiespost-border bg-white px-3 py-2.5 text-sm text-tradiespost-text disabled:opacity-60'

const countOptions = Array.from(
  { length: CLIP_COUNT_MAX - CLIP_COUNT_MIN + 1 },
  (_, i) => CLIP_COUNT_MIN + i,
)

const modeClass = (on: boolean) =>
  `rounded-xl border px-3 py-2.5 text-left text-sm disabled:opacity-60 ${
    on ? 'border-black bg-tradiespost-gold/20 font-black text-black' : 'border-tradiespost-border bg-white font-semibold text-zinc-600'
  }`

export function ClipOptionsFields({ value, onChange, disabled }: Props) {
  const full = value.clipLength === 'full'
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="What to make">
        <button
          type="button"
          role="radio"
          aria-checked={!full}
          disabled={disabled}
          className={modeClass(!full)}
          onClick={() => full && onChange({ ...value, clipLength: 'short', clipCount: CLIP_COUNT_DEFAULT, captionStyle: 'bold' })}
        >
          Make AI clips
          <span className="block text-xs font-normal text-zinc-500">We pick the best moments</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={full}
          disabled={disabled}
          className={modeClass(full)}
          onClick={() => !full && onChange({ ...value, clipLength: 'full', clipCount: 1, captionStyle: 'none' })}
        >
          Use whole video
          <span className="block text-xs font-normal text-zinc-500">Edit &amp; caption it yourself</span>
        </button>
      </div>
      {full ? (
        <p className="text-xs text-zinc-500">
          We’ll keep the whole video (up to 3 minutes) and transcribe it. Open it with Edit to trim, add captions or add text.
        </p>
      ) : null}
      <div className={`grid gap-3 ${full ? '' : 'sm:grid-cols-3'}`}>
        {full ? null : (
          <>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-zinc-600">Number of clips</span>
              <select
                className={selectClass}
                value={value.clipCount}
                disabled={disabled}
                onChange={(e) => onChange({ ...value, clipCount: Number(e.target.value) })}
              >
                {countOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-zinc-600">Clip length</span>
              <select
                className={selectClass}
                value={value.clipLength}
                disabled={disabled}
                onChange={(e) => onChange({ ...value, clipLength: e.target.value === 'medium' ? 'medium' : 'short' })}
              >
                <option value="short">Short (15–30s)</option>
                <option value="medium">Medium (30–60s)</option>
              </select>
            </label>
          </>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-zinc-600">Shape</span>
          <select
            className={selectClass}
            value={value.aspect}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...value, aspect: e.target.value === 'original' ? 'original' : 'vertical' })
            }
          >
            <option value="vertical">Vertical (Reels, TikTok)</option>
            <option value="original">Keep original</option>
          </select>
        </label>
      </div>
      <CaptionStyleFields
        value={{ style: value.captionStyle, position: value.captionPosition }}
        disabled={disabled}
        onChange={(next) =>
          onChange({ ...value, captionStyle: next.style, captionPosition: next.position })
        }
      />
    </div>
  )
}
