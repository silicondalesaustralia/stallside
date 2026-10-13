'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { dateKeyInTimeZone } from '@/lib/utils/australiaSydneyTime'
import { itemLocalTime, timesAt } from '@/lib/unified-calendar/grid'
import type { UnifiedMoveTimes, UnifiedPostItem } from '@/lib/unified-calendar/types'

type Options = {
  onClose: () => void
  onMove: (item: UnifiedPostItem, times: UnifiedMoveTimes) => Promise<void>
}

function imageExtension(type: string): string {
  if (type.includes('webp')) return 'webp'
  if (type.includes('png')) return 'png'
  return 'jpg'
}

export function usePostDrawerActions(item: UnifiedPostItem, timeZone: string, { onClose, onMove }: Options) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [date, setDate] = useState(() => dateKeyInTimeZone(item.startsAt, timeZone))
  const [time, setTime] = useState(() => itemLocalTime(item, timeZone))

  async function postAction(path: 'cancel' | 'mark-posted', confirmText: string, success: string, failure: string) {
    if (!confirm(confirmText)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/social/posts/${item.post.id}/${path}`, { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || failure)
      }
      toast(success, 'success')
      onClose()
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : failure, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function saveReschedule() {
    if (!date) {
      toast('Pick a date', 'error')
      return
    }
    onClose()
    await onMove(item, timesAt(item, date, time || '09:00', timeZone))
  }

  async function downloadImage(url: string) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `vendl-post-${Date.now()}.${imageExtension(blob.type)}`
      a.click()
      URL.revokeObjectURL(a.href)
      toast('Image downloaded', 'success')
    } catch (err) {
      console.error('[calendar] image download failed', err)
      toast('Could not download - try again or save from Library', 'error')
    }
  }

  function copyCaption(text: string) {
    navigator.clipboard.writeText(text).then(
      () => toast('Caption copied', 'success'),
      () => toast('Could not copy the caption', 'error'),
    )
  }

  return {
    busy,
    rescheduleOpen,
    setRescheduleOpen,
    date,
    setDate,
    time,
    setTime,
    saveReschedule,
    downloadImage,
    copyCaption,
    cancelPost: () => postAction('cancel', 'Cancel this scheduled post?', 'Scheduled post cancelled', 'Cancel failed'),
    markPosted: () =>
      postAction('mark-posted', 'Mark this post as manually posted?', 'Marked as posted', 'Could not mark as posted'),
  }
}
