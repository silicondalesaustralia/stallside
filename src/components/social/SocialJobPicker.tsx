'use client'

import { useState } from 'react'
import VendlContentResults from '@/components/social/VendlContentResults'
import { useVendlContentSearch } from '@/components/social/useVendlContentSearch'
import { VENDL_CONTENT_KIND_LABEL, type VendlContentItem } from '@/lib/socialHost/vendlContentTypes'

/** Vendl: the "job" is a mirrored product / pre-order page / subscription / membership. */
export type SocialJobOption = {
  id: string
  title: string
  suburb: string | null
  label: string
}

type Props = {
  value: string | null
  onChange: (jobId: string | null, option: SocialJobOption | null) => void
  disabled?: boolean
  id?: string
  helperText?: string
}

export function SocialJobPicker({
  value,
  onChange,
  disabled,
  id = 'social-job-picker',
  helperText = 'Pick what this post is about and the AI will write about it and can use its photos.',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<VendlContentItem | null>(null)
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const search = useVendlContentSearch(query, open)

  async function pick(item: VendlContentItem) {
    setLinking(true)
    setLinkError(null)
    try {
      const res = await fetch('/api/social/vendl-content/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: item.ref }),
      })
      if (!res.ok) {
        setLinkError('Could not link that item. Try again.')
        return
      }
      const json = (await res.json()) as { jobId: string }
      setSelected(item)
      setOpen(false)
      setQuery('')
      onChange(json.jobId, { id: json.jobId, title: item.title, suburb: null, label: item.title })
    } catch (err) {
      console.error('[SocialJobPicker] link failed', err)
      setLinkError('Could not link that item. Try again.')
    } finally {
      setLinking(false)
    }
  }

  function clear() {
    setSelected(null)
    onChange(null, null)
  }

  const hasValue = Boolean(value)

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#666]">
        What&apos;s this post about? <span className="font-normal text-[#AAA]">(optional)</span>
      </label>
      {hasValue && !open ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#EDEAE2] bg-white px-3 py-2">
          {selected?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.imageUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#333]">{selected?.title ?? 'Linked item'}</span>
            {selected ? (
              <span className="block truncate text-xs text-[#888]">{VENDL_CONTENT_KIND_LABEL[selected.kind]}</span>
            ) : null}
          </span>
          <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="text-xs font-semibold text-[#555] hover:underline">
            Change
          </button>
          <button type="button" disabled={disabled} onClick={clear} className="text-xs font-semibold text-[#B42318] hover:underline">
            Remove
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            id={id}
            type="search"
            value={query}
            disabled={disabled || linking}
            placeholder={linking ? 'Linking…' : 'Search products, pre-order pages, subscriptions…'}
            onFocus={() => setOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
            className="min-h-[44px] w-full rounded-xl border border-[#EDEAE2] bg-white px-3 py-2.5 text-sm text-[#444] outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] disabled:opacity-60"
            data-testid="social-job-picker"
          />
          {open && !linking ? (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#EDEAE2] bg-white shadow-lg">
              <VendlContentResults {...search} query={query} onPick={(item) => void pick(item)} />
              <button type="button" onClick={() => setOpen(false)} className="w-full border-t border-[#F0EDE5] px-3 py-2 text-left text-xs text-[#888] hover:bg-[#FAFAF8]">
                Close
              </button>
            </div>
          ) : null}
        </div>
      )}
      {linkError ? <p className="mt-1.5 text-xs text-[#B42318]">{linkError}</p> : null}
      {helperText ? <p className="mt-1.5 text-xs text-[#888]">{helperText}</p> : null}
    </div>
  )
}
