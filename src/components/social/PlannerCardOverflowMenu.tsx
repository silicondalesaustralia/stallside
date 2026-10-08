'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { PlannerOverflowAction } from '@/lib/social/weekPlan/weekPlanCardActions'

const LABELS: Record<PlannerOverflowAction, string> = {
  chooseAgain: 'Choose another design',
  startAgain: 'Start this post again',
  skip: 'Skip this post',
  move: 'Move date/time',
  cancelSchedule: 'Cancel schedule',
  viewPublished: 'View published history',
}

export function PlannerCardOverflowMenu({
  actions,
  disabled,
  onAction,
}: {
  actions: PlannerOverflowAction[]
  disabled?: boolean
  onAction: (action: PlannerOverflowAction) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (actions.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#EDEAE2] bg-white text-[#666] hover:border-[#CCC] disabled:opacity-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[200px] rounded-xl border border-[#EDEAE2] bg-white py-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                setOpen(false)
                onAction(action)
              }}
              className="block w-full px-4 py-2 text-left text-xs font-semibold text-[#444] hover:bg-[#FAFAF8]"
            >
              {LABELS[action]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
