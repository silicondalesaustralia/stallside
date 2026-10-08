'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  SOCIAL_FONT_FAMILIES,
  normalizeSocialFontFamily,
  type SocialFontFamily,
} from '@/lib/social/socialTextStyle'
import {
  formatSocialFontOptionLabel,
  socialFontStack,
} from '@/lib/social/socialFontWebPreview'

export function SocialFontFamilySelect({
  value,
  onChange,
  previewPhrase,
  label = 'Font',
  families = SOCIAL_FONT_FAMILIES,
  compact = false,
  disabled = false,
  touchFriendly = false,
  testId,
}: {
  value: SocialFontFamily
  onChange: (family: SocialFontFamily) => void
  previewPhrase?: string | null
  /** Pass `null` to hide - parent renders its own label. */
  label?: string | null
  families?: readonly SocialFontFamily[]
  /** Show font name only (no "- Aa Bb Cc" suffix). */
  compact?: boolean
  disabled?: boolean
  touchFriendly?: boolean
  testId?: string
}) {
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const optionLabel = (family: SocialFontFamily) =>
    compact ? family : formatSocialFontOptionLabel(family, previewPhrase)

  const selectedLabel = optionLabel(value)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const idx = families.indexOf(value)
    setHighlightIndex(idx >= 0 ? idx : 0)
  }, [open, value, families])

  useEffect(() => {
    if (!open || highlightIndex < 0) return
    listRef.current?.focus()
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-font-option-index="${highlightIndex}"]`,
    )
    option?.scrollIntoView({ block: 'nearest' })
  }, [open, highlightIndex])

  function selectFamily(family: SocialFontFamily) {
    onChange(normalizeSocialFontFamily(family))
    setOpen(false)
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((idx) => Math.min(idx + 1, families.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((idx) => Math.max(idx - 1, 0))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setHighlightIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setHighlightIndex(families.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const family = families[highlightIndex]
      if (family) selectFamily(family)
    }
  }

  const triggerClass = touchFriendly
    ? 'min-h-[44px] rounded-xl border border-[#EDEAE2] px-3 py-2.5 text-lg'
    : 'rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm'

  const optionClass = touchFriendly
    ? 'min-h-[44px] px-3 py-2.5 text-lg'
    : 'px-3 py-2 text-sm'

  return (
    <div ref={rootRef} className="relative" data-testid={testId}>
      {label != null ? (
        <label className="text-xs font-medium text-[#666] block mb-1">{label}</label>
      ) : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v)
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-2 bg-white text-left text-[#333] focus:outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${triggerClass}`}
        style={{ fontFamily: socialFontStack(value) }}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#888] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label != null ? `${label} options` : 'Font options'}
          aria-activedescendant={
            highlightIndex >= 0 ? `${listId}-option-${highlightIndex}` : undefined
          }
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#EDEAE2] bg-white py-1 shadow-lg focus:outline-none"
        >
          {families.map((family, index) => {
            const selected = family === value
            const highlighted = index === highlightIndex
            return (
              <li key={family} role="presentation">
                <button
                  id={`${listId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-font-option-index={index}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectFamily(family)}
                  className={`flex w-full items-center justify-between gap-2 text-left transition-colors ${optionClass} ${
                    selected || highlighted
                      ? 'bg-indigo-50 text-indigo-900'
                      : 'text-[#333] hover:bg-[#FAFAF7]'
                  }`}
                  style={{ fontFamily: socialFontStack(family) }}
                >
                  <span className="min-w-0 truncate">{optionLabel(family)}</span>
                  {selected ? (
                    <span className="shrink-0 text-xs font-semibold text-indigo-600" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
