'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { rescheduleCalendarEventAction } from '@/app/dashboard/(gated)/calendar/actions'
import { movedTimes } from '@/lib/unified-calendar/grid'
import type {
  UnifiedItem,
  UnifiedMoveTimes,
  UnifiedSlot,
} from '@/lib/unified-calendar/types'

type Moves = Record<string, UnifiedMoveTimes>
const NO_MOVES: Moves = {}

async function persistMove(item: UnifiedItem, times: UnifiedMoveTimes): Promise<void> {
  if (item.kind === 'post') {
    const res = await fetch(`/api/social/posts/${item.post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_for: times.startsAt }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error || 'Could not move this post')
    }
    return
  }
  const { rescheduleAction, sourceId, metadata } = item.event
  if (!rescheduleAction) {
    throw new Error('This comes from your orders - edit the source record instead.')
  }
  const result = await rescheduleCalendarEventAction({
    rescheduleAction,
    sourceId,
    startsAt: times.startsAt,
    endsAt: times.endsAt,
    allDay: item.allDay,
    metadata,
  })
  if (!result.ok) throw new Error(result.error)
}

/** Optimistic moves, cleared when the server sends fresh items after refresh. */
export function useCalendarMoves(items: UnifiedItem[], timeZone: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [, startTransition] = useTransition()
  const [state, setState] = useState<{ base: UnifiedItem[]; moves: Moves }>({
    base: items,
    moves: NO_MOVES,
  })
  const moves = state.base === items ? state.moves : NO_MOVES

  const liveItems = useMemo(
    () => items.map((item) => (moves[item.id] ? { ...item, ...moves[item.id] } : item)),
    [items, moves],
  )

  function setMove(itemId: string, times: UnifiedMoveTimes | null) {
    setState((prev) => {
      const next = { ...(prev.base === items ? prev.moves : NO_MOVES) }
      if (times) next[itemId] = times
      else delete next[itemId]
      return { base: items, moves: next }
    })
  }

  async function moveItem(item: UnifiedItem, times: UnifiedMoveTimes): Promise<void> {
    setMove(item.id, times)
    try {
      await persistMove(item, times)
      toast(item.kind === 'post' ? 'Post rescheduled' : 'Rescheduled', 'success')
      startTransition(() => router.refresh())
    } catch (err) {
      setMove(item.id, null)
      toast(err instanceof Error ? err.message : 'Could not reschedule', 'error')
    }
  }

  function dropOnSlot(itemId: string, slot: UnifiedSlot) {
    const item = liveItems.find((i) => i.id === itemId)
    if (!item?.draggable) return
    const times = movedTimes(item, slot, timeZone)
    if (times.startsAt === item.startsAt) return
    void moveItem(item, times)
  }

  return { liveItems, moveItem, dropOnSlot }
}
