'use client'

import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/** Shared one-of-many choice card - light default, gold tint + check when selected. */
export function tradiesPostSelectableCardClasses(
  selected: boolean,
  tone: 'default' | 'white' = 'default',
): string {
  const base =
    'relative w-full rounded-2xl border-2 text-left transition-all duration-150 ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]'

  if (selected) {
    const selectedBg = tone === 'white' ? 'bg-white' : 'bg-[#FFFBEB]'
    return `${base} border-[#F5C518] ${selectedBg} shadow-md`
  }

  const hoverBg = tone === 'white' ? 'hover:bg-white' : 'hover:bg-[#FBF9F5]'

  return (
    `${base} border-[#E8E6E1] bg-white shadow-sm ` +
    `hover:border-[#D4D2CC] ${hoverBg} hover:shadow-md hover:-translate-y-0.5`
  )
}

type TradiesPostSelectableCardProps = {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
  testId?: string
  ariaLabel?: string
  /** Keeps white background when selected (border + check only). */
  tone?: 'default' | 'white'
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-describedby'>

export function TradiesPostSelectableCard({
  selected,
  onClick,
  children,
  className = '',
  testId,
  ariaLabel,
  tone = 'default',
  'aria-describedby': ariaDescribedBy,
}: TradiesPostSelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-testid={testId}
      data-selected={selected ? 'true' : 'false'}
      className={`${tradiesPostSelectableCardClasses(selected, tone)} ${className}`}
    >
      {selected ? (
        <span
          className="pointer-events-none absolute right-2.5 top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5C518] text-[#18181B] shadow-sm"
          aria-hidden
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : null}
      {children}
    </button>
  )
}
