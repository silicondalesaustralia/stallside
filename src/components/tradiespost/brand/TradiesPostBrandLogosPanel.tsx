'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Star, Trash2, Upload } from 'lucide-react'
import {
  BRAND_LOGO_VARIANT_LABELS,
  BRAND_LOGO_VARIANT_TYPES,
  type BrandLogoAsset,
  type BrandLogoVariantType,
} from '@/lib/brand/businessBrandLogos'
import { readApiJson } from '@/lib/http/readApiJson'
import { useToast } from '@/components/ui/Toast'
import { TradiesPostButtonLight } from '@/components/tradiespost/ui/TradiesPostButton'
import { TradiesPostMeta } from '@/components/tradiespost/ui/TradiesPostTypography'

type LogoDto = BrandLogoAsset & { previewUrl?: string | null }

/**
 * TradiesPost presentation shell for the brand logo library.
 * Uses the same /api/settings/brand-logos* routes and behaviour as BrandLogosPanel.
 */
export function TradiesPostBrandLogosPanel({
  onPrimaryChange,
  readOnly = false,
}: {
  onPrimaryChange?: (logoUrl: string | null) => void
  readOnly?: boolean
}) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [logos, setLogos] = useState<LogoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [variantType, setVariantType] = useState<BrandLogoVariantType>('other')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refresh() {
    const res = await fetch('/api/settings/brand-logos')
    const json = await readApiJson<{ logos?: LogoDto[] }>(res)
    if (!res.ok) throw new Error('Failed to load logos')
    setLogos(json.logos ?? [])
  }

  useEffect(() => {
    void refresh()
      .catch(() => toast('Could not load brand logos.', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      if (displayName.trim()) body.append('displayName', displayName.trim())
      body.append('variantType', variantType)
      const res = await fetch('/api/settings/brand-logos', { method: 'POST', body })
      const json = await readApiJson<{ error?: string; primaryLogoUrl?: string }>(res)
      if (!res.ok) throw new Error(json.error || 'Failed to upload logo')
      setDisplayName('')
      await refresh()
      if (json.primaryLogoUrl) onPrimaryChange?.(json.primaryLogoUrl)
      toast('Logo added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to upload logo.', 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function setPrimary(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/settings/brand-logos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      })
      const json = await readApiJson<{ error?: string; primaryLogoUrl?: string | null }>(res)
      if (!res.ok) throw new Error(json.error || 'Failed to set primary')
      await refresh()
      onPrimaryChange?.(json.primaryLogoUrl ?? null)
      toast('Primary logo updated.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to set primary.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function rename(id: string, nextName: string) {
    const trimmed = nextName.trim()
    if (!trimmed) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/settings/brand-logos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmed }),
      })
      if (!res.ok) throw new Error('Failed to rename logo')
      await refresh()
    } catch {
      toast('Failed to rename logo.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/settings/brand-logos/${id}`, { method: 'DELETE' })
      const json = await readApiJson<{ error?: string; primaryLogoUrl?: string | null }>(res)
      if (!res.ok) throw new Error(json.error || 'Failed to delete logo')
      await refresh()
      onPrimaryChange?.(json.primaryLogoUrl ?? null)
      toast('Logo removed.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete logo.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div id="logo" data-testid="brand-logos-panel">
      <TradiesPostMeta className="mb-4">
        Add approved logo versions for different backgrounds. Your primary logo appears on posts.
      </TradiesPostMeta>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading logos…</p>
      ) : logos.length === 0 ? (
        <p className="mb-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          No business logo added yet.
        </p>
      ) : (
        <ul className="mb-6 grid gap-3 sm:grid-cols-2">
          {logos.map((logo) => (
            <li
              key={logo.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
              data-testid={`brand-logo-${logo.id}`}
            >
              <div className="flex items-center justify-center bg-zinc-50 p-4">
                <div className="relative h-28 w-full max-w-[200px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 sm:h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      logo.previewUrl ||
                      `/api/settings/logo?t=${encodeURIComponent(logo.publicUrl || '')}`
                    }
                    alt={logo.displayName}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2 border-t border-zinc-100 p-3">
                <input
                  defaultValue={logo.displayName}
                  disabled={readOnly}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== logo.displayName) {
                      void rename(logo.id, e.target.value)
                    }
                  }}
                  className="w-full rounded-lg border border-transparent bg-transparent px-1 text-sm font-bold text-[#18181B] hover:border-zinc-200 focus:border-[#F5C518] focus:outline-none disabled:hover:border-transparent"
                  aria-label="Logo name"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                    {BRAND_LOGO_VARIANT_LABELS[logo.variantType]}
                  </span>
                  {logo.isPrimary ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-[#886600]">
                      <Star className="h-3 w-3 fill-[#F5C518] text-[#F5C518]" />
                      Primary
                    </span>
                  ) : null}
                </div>
                {!readOnly ? (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {!logo.isPrimary && (
                    <button
                      type="button"
                      onClick={() => void setPrimary(logo.id)}
                      disabled={busyId === logo.id}
                      className="text-xs font-bold text-[#18181B] underline decoration-[#F5C518]/60 hover:decoration-[#F5C518] disabled:opacity-50"
                    >
                      Set as primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void remove(logo.id)}
                    disabled={busyId === logo.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {readOnly ? null : (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-zinc-500">Add logo</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-zinc-600">
            Name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. White version"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[#18181B] focus:border-[#F5C518] focus:outline-none focus:ring-1 focus:ring-[#F5C518]/40"
            />
          </label>
          <label className="block text-xs font-semibold text-zinc-600">
            Type
            <select
              value={variantType}
              onChange={(e) => setVariantType(e.target.value as BrandLogoVariantType)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[#18181B] focus:border-[#F5C518] focus:outline-none"
            >
              {BRAND_LOGO_VARIANT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {BRAND_LOGO_VARIANT_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
        <TradiesPostButtonLight
          type="button"
          variant="secondary"
          size="md"
          className="mt-3 w-full sm:w-auto"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload logo
            </>
          )}
        </TradiesPostButtonLight>
      </div>
      )}
    </div>
  )
}
