'use client'

import { SocialCalendarEventDrawer } from '@/components/social/SocialCalendarEventDrawer'
import type { UnifiedMoveTimes, UnifiedPostItem } from '@/lib/unified-calendar/types'
import { usePostDrawerActions } from './usePostDrawerActions'

type Props = {
  item: UnifiedPostItem
  timeZone: string
  onClose: () => void
  onMove: (item: UnifiedPostItem, times: UnifiedMoveTimes) => Promise<void>
}

export default function UnifiedPostDrawer({ item, timeZone, onClose, onMove }: Props) {
  const actions = usePostDrawerActions(item, timeZone, { onClose, onMove })
  return (
    <SocialCalendarEventDrawer
      post={{ ...item.post, scheduled_for: item.startsAt }}
      timeZone={timeZone}
      busy={actions.busy}
      rescheduleOpen={actions.rescheduleOpen}
      rescheduleDate={actions.date}
      rescheduleTime={actions.time}
      onClose={onClose}
      onMarkPosted={() => void actions.markPosted()}
      onDownload={(url) => void actions.downloadImage(url)}
      onCopyCaption={actions.copyCaption}
      onOpenReschedule={() => actions.setRescheduleOpen(true)}
      onRescheduleDate={actions.setDate}
      onRescheduleTime={actions.setTime}
      onSaveReschedule={() => void actions.saveReschedule()}
      onCancelPost={() => void actions.cancelPost()}
    />
  )
}
