'use client'

import { useMemo, useState } from 'react'
import { UNIFIED_CATEGORY_ORDER } from '@/lib/unified-calendar/categories'
import type { UnifiedCategory, UnifiedItem } from '@/lib/unified-calendar/types'

/** `null` active set means "show everything". */
export function useCategoryFilter(items: UnifiedItem[], initial: UnifiedCategory[] | null) {
  const [active, setActive] = useState<Set<UnifiedCategory> | null>(
    initial ? new Set(initial) : null,
  )

  const counts = useMemo(() => {
    const map = new Map<UnifiedCategory, number>()
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1)
    return map
  }, [items])

  const available = useMemo(
    () =>
      UNIFIED_CATEGORY_ORDER.filter(
        (c) => c === 'social' || counts.has(c) || active?.has(c),
      ),
    [counts, active],
  )

  const visible = useMemo(
    () => (active ? items.filter((i) => active.has(i.category)) : items),
    [items, active],
  )

  function toggle(category: UnifiedCategory) {
    setActive((prev) => {
      if (!prev) return new Set([category])
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next.size === 0 || available.every((c) => next.has(c)) ? null : next
    })
  }

  return {
    available,
    counts,
    visible,
    isActive: (category: UnifiedCategory) => !active || active.has(category),
    allActive: active === null,
    toggle,
    showAll: () => setActive(null),
  }
}
