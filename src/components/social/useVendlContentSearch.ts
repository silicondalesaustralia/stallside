'use client'

import { useEffect, useState } from 'react'
import type { VendlContentItem } from '@/lib/socialHost/vendlContentTypes'

const DEBOUNCE_MS = 250

/** Debounced search over the stand's products, pre-order pages and offers. */
export function useVendlContentSearch(query: string, enabled: boolean) {
  const [items, setItems] = useState<VendlContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/social/vendl-content?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          setError('Could not load your products and offers.')
          setItems([])
          return
        }
        const json = (await res.json()) as { items?: VendlContentItem[] }
        setItems(json.items ?? [])
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[useVendlContentSearch]', err)
        setError('Could not load your products and offers.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, enabled])

  return { items, loading, error }
}
