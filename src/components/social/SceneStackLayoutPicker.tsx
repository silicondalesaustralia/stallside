'use client'

import {
  SCENE_STACK_ANCHOR_LABELS,
  SCENE_STACK_ANCHORS,
  SCENE_STACK_OFFSET_MAX,
  SCENE_STACK_OFFSET_MIN,
  type SceneStackAnchor,
  type SceneStackLayout,
} from '@/lib/social/sceneStackLayout'

const ANCHOR_DOT: Record<SceneStackAnchor, string> = {
  'top-left': 'top-1 left-1',
  'top-center': 'top-1 left-1/2 -translate-x-1/2',
  'top-right': 'top-1 right-1',
  'bottom-left': 'bottom-1 left-1',
  'bottom-center': 'bottom-1 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-1 right-1',
}

function OffsetSlider({
  label,
  minLabel,
  maxLabel,
  value,
  onChange,
  onCommit,
  disabled,
}: {
  label: string
  minLabel: string
  maxLabel: string
  value: number
  onChange: (next: number) => void
  onCommit?: (next: number) => void
  disabled?: boolean
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] font-semibold text-[#888]">{label}</label>
        <span className="text-[10px] font-mono text-[#AAA]">{value}%</span>
      </div>
      <input
        type="range"
        min={SCENE_STACK_OFFSET_MIN}
        max={SCENE_STACK_OFFSET_MAX}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
        className="w-full accent-[#FFD700]"
        aria-label={label}
      />
      <div className="flex justify-between text-[9px] text-[#BBB]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

export function SceneStackLayoutPicker({
  value,
  onChange,
  onCommit,
  disabled,
}: {
  value: SceneStackLayout
  onChange: (next: SceneStackLayout) => void
  /** Slider release / preset click - use for DB saves. Live preview can use onChange only. */
  onCommit?: (next: SceneStackLayout) => void
  disabled?: boolean
}) {
  const nudged = value.stackOffsetX !== 0 || value.stackOffsetY !== 0

  function apply(next: SceneStackLayout, commit: boolean) {
    onChange(next)
    if (commit) onCommit?.(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {SCENE_STACK_ANCHORS.map((anchor) => {
          const selected = value.stackAnchor === anchor
          return (
            <button
              key={anchor}
              type="button"
              disabled={disabled}
              title={SCENE_STACK_ANCHOR_LABELS[anchor]}
              aria-label={SCENE_STACK_ANCHOR_LABELS[anchor]}
              aria-pressed={selected}
              onClick={() => apply({ ...value, stackAnchor: anchor }, true)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors ${
                selected
                  ? 'border-[#FFD700] bg-[#FFFBEA] ring-1 ring-[#FFD700]/40'
                  : 'border-[#E0DDD5] bg-white hover:border-[#CCC]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="relative h-9 w-9 overflow-hidden rounded border border-[#DDD] bg-[#F5F5F2]">
                <span
                  className={`absolute h-1.5 w-3.5 rounded-sm bg-[#FFD700] ${ANCHOR_DOT[anchor]}`}
                />
              </div>
              <span className="text-[9px] font-semibold text-[#888] leading-none text-center">
                {SCENE_STACK_ANCHOR_LABELS[anchor]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-2 rounded-lg border border-[#EDEAE2] bg-white px-3 py-2.5">
        <p className="text-[10px] font-semibold text-[#888]">Nudge from this corner</p>
        <OffsetSlider
          label="Left / right"
          minLabel="Left"
          maxLabel="Right"
          value={value.stackOffsetX}
          disabled={disabled}
          onChange={(stackOffsetX) => apply({ ...value, stackOffsetX }, false)}
          onCommit={(stackOffsetX) => apply({ ...value, stackOffsetX }, true)}
        />
        <OffsetSlider
          label="Up / down"
          minLabel="Up"
          maxLabel="Down"
          value={value.stackOffsetY}
          disabled={disabled}
          onChange={(stackOffsetY) => apply({ ...value, stackOffsetY }, false)}
          onCommit={(stackOffsetY) => apply({ ...value, stackOffsetY }, true)}
        />
        {nudged && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => apply({ ...value, stackOffsetX: 0, stackOffsetY: 0 }, true)}
            className="text-[11px] font-semibold text-[#888] hover:text-[#333]"
          >
            Reset nudge
          </button>
        )}
      </div>
    </div>
  )
}
