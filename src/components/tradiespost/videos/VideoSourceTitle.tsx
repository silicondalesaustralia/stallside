'use client'

import { useState } from 'react'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Props = { sourceId: string; title: string | null; onRenamed: () => void }

export function VideoSourceTitle({ sourceId, title, onRenamed }: Props) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title ?? '')
  const [saving, setSaving] = useState(false)

  function start() {
    setDraft(title ?? '')
    setEditing(true)
  }

  async function save() {
    const next = draft.trim()
    if (!next || next === title) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/social/videos/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: next }),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || 'Could not rename video')
      }
      setEditing(false)
      onRenamed()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not rename video', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <h2 className="truncate text-base font-black text-tradiespost-text">{title || 'Untitled video'}</h2>
        <button type="button" onClick={start} className="shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Rename video">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <form
      className="flex min-w-0 items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <input
        autoFocus
        value={draft}
        maxLength={120}
        disabled={saving}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
        className="min-w-0 flex-1 rounded-lg border border-tradiespost-border px-2 py-1 text-sm font-bold text-tradiespost-text"
        aria-label="Video name"
      />
      <button type="submit" disabled={saving} className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50" aria-label="Save name">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button type="button" disabled={saving} onClick={() => setEditing(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Cancel rename">
        <X className="h-4 w-4" />
      </button>
    </form>
  )
}
