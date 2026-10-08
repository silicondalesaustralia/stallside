'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  RecreateLogoPicker,
  type RecreateLogoSelection,
} from '@/components/social/RecreateLogoPicker'

type TradiesPostCompactLogoPickerProps = {
  value: RecreateLogoSelection
  onChange: (next: RecreateLogoSelection) => void
  disabled?: boolean
}

export function TradiesPostCompactLogoPicker({
  value,
  onChange,
  disabled,
}: TradiesPostCompactLogoPickerProps) {
  const [open, setOpen] = useState(false)

  const label =
    value.logoAssetId === null
      ? 'No logo'
      : value.logoAssetId === undefined
        ? 'Primary logo'
        : 'Selected logo'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3" data-testid="tp-compact-logo">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-700">
          <span className="font-semibold text-[#18181B]">Logo:</span>
          <span className="inline-flex items-center gap-1 truncate">
            {label}
            {value.logoAssetId !== null && value.logoAssetId !== undefined ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            ) : null}
          </span>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#18181B] hover:text-zinc-600 disabled:opacity-50"
          aria-expanded={open}
        >
          Change
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      </div>
      {open && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <RecreateLogoPicker value={value} onChange={onChange} disabled={disabled} />
        </div>
      )}
    </div>
  )
}
