'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { SocialTabPanel } from '@/components/social/SocialTabPanel'
import { SocialProductVariantProvider } from '@/components/tradiespost/SocialProductVariant'
import { useTradiesPostSocialWorkspace } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import type { HybridRenderListItem } from '@/lib/social/libraryRenderUtils'

/** Renders created slightly before the drawer opened (clock skew) still count as new. */
const CLOCK_SKEW_MS = 5_000

type Props = {
  open: boolean
  jobId: string | null
  onClose: () => void
  onPicked: (render: HybridRenderListItem) => void
}

async function fetchLatestRender(): Promise<HybridRenderListItem | null> {
  const res = await fetch('/api/social/hybrid-renders?limit=1&status=completed')
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || `HTTP ${res.status}`)
  }
  const json = (await res.json()) as { renders?: HybridRenderListItem[] }
  return json.renders?.[0] ?? null
}

export function ComposerAiStudioDrawer({ open, jobId, onClose, onPicked }: Props) {
  const ctx = useTradiesPostSocialWorkspace()
  const openedAtRef = useRef(0)
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      openedAtRef.current = Date.now()
      setMessage(null)
    }
  }, [open])

  const pickLatest = useCallback(async () => {
    setChecking(true)
    setMessage(null)
    try {
      const latest = await fetchLatestRender()
      const isNew =
        latest && new Date(latest.created_at).getTime() >= openedAtRef.current - CLOCK_SKEW_MS
      if (latest && isNew && latest.result_url) {
        onPicked(latest)
        return
      }
      setMessage('No new image yet. Finish creating one, then tap Use this image.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not check for your new image')
    } finally {
      setChecking(false)
    }
  }, [onPicked])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-tradiespost-surface" role="dialog" aria-modal="true">
      <div className="flex items-center gap-3 border-b border-[#E4E4E7] bg-white px-4 py-3">
        <p className="text-sm font-black text-[#18181B]">Create with AI</p>
        {message && <p className="hidden text-xs text-amber-700 sm:block">{message}</p>}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => void pickLatest()}
            disabled={checking}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F5C518] px-3.5 py-2 text-xs font-black text-[#18181B] disabled:opacity-50"
            data-testid="composer-ai-use-latest"
          >
            {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Use this image
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      {message && <p className="bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:hidden">{message}</p>}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 sm:p-6" data-tp-social>
          <SocialProductVariantProvider variant="tradiespost">
            <SocialTabPanel
              variant="tradiespost"
              tab="create"
              business={ctx.business}
              posts={ctx.posts}
              loadError={ctx.loadError}
              loadData={() => void ctx.loadData({ force: true })}
              setBusiness={ctx.setBusiness}
              infographicAiBackgroundEnabled={ctx.infographicAiBackgroundEnabled}
              aiDesignedEnabled={ctx.aiDesignedEnabled}
              connectionsHref="/dashboard/social/connections"
              initialJobId={jobId}
              onViewLibrary={() => void pickLatest()}
            />
          </SocialProductVariantProvider>
        </div>
      </div>
    </div>
  )
}
