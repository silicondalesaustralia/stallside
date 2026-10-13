'use client'

import { TradiesPostCalendarEventCard } from '@/components/tradiespost/calendar/TradiesPostCalendarEventCard'
import type { UnifiedItem } from '@/lib/unified-calendar/types'
import UnifiedEventCard from './UnifiedEventCard'
import { dragSourceProps } from './dnd'

type Props = {
  item: UnifiedItem
  timeZone: string
  selected: boolean
  variant: 'mini' | 'compact' | 'full'
  onSelect: (item: UnifiedItem) => void
}

/** Clicks stop here so the cell underneath doesn't open "Schedule something". */
export default function UnifiedCalendarItemCard({ item, timeZone, selected, variant, onSelect }: Props) {
  return (
    <div
      {...dragSourceProps(item)}
      onClick={(e) => e.stopPropagation()}
      className={item.draggable ? 'cursor-grab active:cursor-grabbing' : undefined}
    >
      {item.kind === 'post' ? (
        <TradiesPostCalendarEventCard
          post={{ ...item.post, scheduled_for: item.startsAt }}
          timeZone={timeZone}
          selected={selected}
          mini={variant === 'mini'}
          compact={variant === 'compact'}
          onSelect={() => onSelect(item)}
        />
      ) : (
        <UnifiedEventCard
          item={item}
          timeZone={timeZone}
          selected={selected}
          variant={variant}
          onSelect={() => onSelect(item)}
        />
      )}
    </div>
  )
}
