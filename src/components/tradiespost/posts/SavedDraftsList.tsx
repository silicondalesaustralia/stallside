'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { deleteSavedDraft, listSavedDrafts } from '@/components/tradiespost/composer/composerDraftApi'
import type { SavedDraftSummary } from '@/lib/tradiespost/composer/composerDraft'

function updatedLabel(iso: string): string {
  return new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

/** Drafts saved from Create ("Save draft"); open to keep editing, or delete. */
export function SavedDraftsList() {
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<SavedDraftSummary[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listSavedDrafts()
      .then((result) => alive && setDrafts(result.drafts))
      .catch((err: unknown) => console.warn('[Posts] could not load saved drafts', err))
    return () => {
      alive = false
    }
  }, [])

  async function remove(id: string) {
    setBusyId(id)
    try {
      await deleteSavedDraft(id)
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast('Draft deleted', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete the draft', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (!drafts.length) return null

  return (
    <section className="mb-6" data-testid="saved-drafts">
      <h2 className="mb-2 text-sm font-black text-[#18181B]">Drafts ({drafts.length})</h2>
      <div className="space-y-2">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-3">
            {draft.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F4F4F5]">
                <FileText className="h-5 w-5 text-zinc-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#18181B]">{draft.caption || 'No caption yet'}</p>
              <p className="text-xs text-zinc-500">Saved {updatedLabel(draft.updatedAt)}</p>
            </div>
            <Link
              href={`/dashboard/social/create?draft=${draft.id}`}
              className="rounded-xl bg-[#18181B] px-3 py-1.5 text-xs font-bold text-white"
            >
              Open
            </Link>
            <button
              type="button"
              onClick={() => void remove(draft.id)}
              disabled={busyId === draft.id}
              aria-label="Delete draft"
              className="rounded-xl border border-[#E4E4E7] p-1.5 text-zinc-500 hover:text-red-600 disabled:opacity-50"
            >
              {busyId === draft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
