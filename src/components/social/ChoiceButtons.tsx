'use client'

import { SelectablePillGroup } from '@/components/ui/SelectablePill'

export function ChoiceButtons<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { id: T; label: string }[]
  value: T | null
  onChange: (id: T) => void
  disabled?: boolean
}) {
  return (
    <SelectablePillGroup
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
