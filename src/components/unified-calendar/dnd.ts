import type { DragEvent } from 'react'
import type { UnifiedItem, UnifiedSlot } from '@/lib/unified-calendar/types'

const DRAG_MIME = 'application/x-vendl-calendar-item'

export function dragSourceProps(item: UnifiedItem) {
  if (!item.draggable) return {}
  return {
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.setData(DRAG_MIME, item.id)
      e.dataTransfer.effectAllowed = 'move'
    },
  }
}

export function dropTargetProps(
  slot: UnifiedSlot,
  onDropItem: (itemId: string, slot: UnifiedSlot) => void,
) {
  return {
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!e.dataTransfer.types.includes(DRAG_MIME)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      const itemId = e.dataTransfer.getData(DRAG_MIME)
      if (!itemId) return
      e.preventDefault()
      onDropItem(itemId, slot)
    },
  }
}
