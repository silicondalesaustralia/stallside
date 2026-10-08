'use client'

import { forwardRef } from 'react'
import { selectablePillButtonClass } from '@/lib/design/tokens'

interface SelectablePillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export const SelectablePill = forwardRef<HTMLButtonElement, SelectablePillProps>(
  ({ selected = false, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`${selectablePillButtonClass(selected, disabled)} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

SelectablePill.displayName = 'SelectablePill'

interface SelectablePillGroupProps<T extends string> {
  options: { id: T; label: string }[]
  value: T | null
  onChange: (id: T) => void
  disabled?: boolean
  className?: string
}

export function SelectablePillGroup<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className = '',
}: SelectablePillGroupProps<T>) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((opt) => (
        <SelectablePill
          key={opt.id}
          selected={value === opt.id}
          disabled={disabled}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </SelectablePill>
      ))}
    </div>
  )
}
