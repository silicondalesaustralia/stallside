'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchRenderCreditsSummary,
  type RenderCreditsSummary,
} from '@/lib/renders/renderCreditsTypes'
import { notifyTradiesPostCreditsChanged } from '@/lib/tradiespost/creditsEvents'

export function useRenderCredits() {
  const [credits, setCredits] = useState<RenderCreditsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    try {
      const summary = await fetchRenderCreditsSummary()
      setCredits(summary)
      notifyTradiesPostCreditsChanged()
    } catch {
      setCredits(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  /** Refetch when returning from billing / another tab (e.g. after top-up). */
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void refresh({ silent: true })
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [refresh])

  return { credits, loading, refresh }
}
