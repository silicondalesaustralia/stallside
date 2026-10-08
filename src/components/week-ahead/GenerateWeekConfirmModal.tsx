'use client'

import { Loader2 } from 'lucide-react'

type Props = {
  open: boolean
  itemCount: number
  previewCount: number
  creditsRequired: number
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function GenerateWeekConfirmModal({
  open,
  itemCount,
  previewCount,
  creditsRequired,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-black">Generate your week?</h3>
        <p className="mt-2 text-sm text-[#555]">
          StitchedUp will create 3 AI Designed options for each planned post.
        </p>
        <ul className="mt-4 space-y-1 text-sm text-[#333]">
          <li>
            <span className="font-bold">{itemCount}</span> post{itemCount === 1 ? '' : 's'}
          </li>
          <li>
            <span className="font-bold">{previewCount}</span> design options
          </li>
          <li>
            Cost: <span className="font-bold">{creditsRequired}</span> render
            {creditsRequired === 1 ? '' : 's'}
          </li>
        </ul>
        <p className="mt-3 text-xs text-[#888]">
          After generation starts, used renders cannot be undone except when all three versions fail.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#EDEAE2] py-2.5 text-sm font-bold text-[#444]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Generate {itemCount} post{itemCount === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  )
}
