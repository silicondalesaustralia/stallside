'use client'

import { useMemo, useState, type DragEvent, type HTMLAttributes } from 'react'
import { useToast } from '@/components/ui/Toast'
import {
  CALENDAR_POST_DRAG_MIME,
  calendarDropKey,
  calendarDropTargetIso,
  sameInstant,
} from '@/lib/social/calendarDragDrop'
import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'

export type CalendarDragBindings = {
  draggingId: string | null
  cardProps: (post: SocialCalendarPost) => HTMLAttributes<HTMLDivElement>
  cellProps: (dayKey: string, hour?: number) => HTMLAttributes<HTMLDivElement>
  isOver: (dayKey: string, hour?: number) => boolean
}

export function useCalendarPostDrag(
  posts: SocialCalendarPost[],
  timeZone: string,
  onRefresh: () => void,
): { displayPosts: SocialCalendarPost[]; drag: CalendarDragBindings } {
  const { toast } = useToast()
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)

  const displayPosts = useMemo(
    () =>
      posts.map((p) => {
        const moved = overrides[p.id]
        if (!moved || (p.scheduled_for && sameInstant(p.scheduled_for, moved))) return p
        return { ...p, scheduled_for: moved }
      }),
    [posts, overrides],
  )

  function clearOverride(postId: string) {
    setOverrides((o) => {
      const next = { ...o }
      delete next[postId]
      return next
    })
  }

  async function movePost(post: SocialCalendarPost, dayKey: string, hour?: number) {
    if (!post.scheduled_for) return
    const targetIso = calendarDropTargetIso(post.scheduled_for, dayKey, hour, timeZone)
    if (sameInstant(targetIso, post.scheduled_for)) return
    if (new Date(targetIso).getTime() <= Date.now()) {
      toast('Posts can only be moved to a future date and time', 'error')
      return
    }

    setOverrides((o) => ({ ...o, [post.id]: targetIso }))
    try {
      const res = await fetch(`/api/social/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_for: targetIso }),
      })
      if (!res.ok) {
        const json: { error?: string } = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Reschedule failed')
      }
      toast('Post rescheduled', 'success')
      onRefresh()
    } catch (err) {
      clearOverride(post.id)
      toast(err instanceof Error ? err.message : 'Reschedule failed', 'error')
    }
  }

  function endDrag() {
    setDraggingId(null)
    setOverKey(null)
  }

  const drag: CalendarDragBindings = {
    draggingId,
    cardProps: (post) => ({
      draggable: true,
      onDragStart: (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData(CALENDAR_POST_DRAG_MIME, post.id)
        e.dataTransfer.effectAllowed = 'move'
        setDraggingId(post.id)
      },
      onDragEnd: endDrag,
    }),
    cellProps: (dayKey, hour) => {
      const key = calendarDropKey(dayKey, hour)
      return {
        onDragOver: (e: DragEvent<HTMLDivElement>) => {
          if (!draggingId) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          if (overKey !== key) setOverKey(key)
        },
        onDragLeave: (e: DragEvent<HTMLDivElement>) => {
          if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return
          setOverKey((k) => (k === key ? null : k))
        },
        onDrop: (e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          const id = e.dataTransfer.getData(CALENDAR_POST_DRAG_MIME) || draggingId
          endDrag()
          const post = displayPosts.find((p) => p.id === id)
          if (post) void movePost(post, dayKey, hour)
        },
      }
    },
    isOver: (dayKey, hour) => overKey === calendarDropKey(dayKey, hour),
  }

  return { displayPosts, drag }
}
