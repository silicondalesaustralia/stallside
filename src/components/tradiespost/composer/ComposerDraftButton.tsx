'use client'

import { Loader2, Save } from 'lucide-react'

type Props = {
  saving: boolean
  savedAt: string | null
  error: string | null
  onSave: () => void
}

function savedLabel(savedAt: string): string {
  const time = new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return `Draft saved at ${time}. Find it under Posts.`
}

export function ComposerDraftButton({ saving, savedAt, error, onSave }: Props) {
  return (
    <div className="space-y-1.5" data-testid="composer-save-draft">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-bold text-[#18181B] hover:border-[#F5C518] disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Saving…' : 'Save draft'}
      </button>
      {error ? (
        <p className="text-xs font-semibold text-red-600">{error}</p>
      ) : savedAt ? (
        <p className="text-xs text-zinc-500">{savedLabel(savedAt)}</p>
      ) : null}
    </div>
  )
}
