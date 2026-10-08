'use client'

import { useEffect, useState } from 'react'
import {
  BRAND_LOGO_VARIANT_LABELS,
  RECREATE_NO_LOGO_ID,
  type BrandLogoAsset,
} from '@/lib/brand/businessBrandLogos'
import { readApiJson } from '@/lib/http/readApiJson'
import { InfoGuide } from '@/components/ui/InfoGuide'

export type RecreateLogoSelection = {
  logoAssetId: string | null | undefined
  logoVariantType: string | null
}

type LogoDto = BrandLogoAsset & { previewUrl?: string | null }

export function RecreateLogoPicker({
  value,
  onChange,
  disabled,
}: {
  value: RecreateLogoSelection
  onChange: (next: RecreateLogoSelection) => void
  disabled?: boolean
}) {
  const [logos, setLogos] = useState<LogoDto[] | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/settings/brand-logos')
        const json = await readApiJson<{ logos?: LogoDto[] }>(res)
        if (cancelled || !res.ok) return
        const next = json.logos ?? []
        setLogos(next)
        if (value.logoAssetId === undefined) return
        if (value.logoAssetId === null) return
        if (next.some((logo) => logo.id === value.logoAssetId)) return
        const primary = next.find((logo) => logo.isPrimary) ?? next[0]
        onChange(
          primary
            ? { logoAssetId: primary.id, logoVariantType: primary.variantType }
            : { logoAssetId: null, logoVariantType: null },
        )
      } catch {
        if (!cancelled) setLogos([])
      }
    })()
    return () => {
      cancelled = true
    }
    // Load once; parent owns later selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (logos === null) {
    return <p className="text-[11px] text-[#888]">Loading logos…</p>
  }

  if (logos.length === 0) {
    return (
      <p className="text-[11px] text-[#888]" data-testid="recreate-no-logo-hint">
        No business logo added yet.{' '}
        <a href="/dashboard/social/brand#logo" className="font-semibold text-indigo-600 hover:underline">
          Add one in Settings
        </a>
      </p>
    )
  }

  const selected =
    value.logoAssetId === null
      ? null
      : logos.find((logo) => logo.id === value.logoAssetId) ??
        logos.find((logo) => logo.isPrimary) ??
        logos[0]
  const selectValue = value.logoAssetId === null ? RECREATE_NO_LOGO_ID : selected?.id ?? RECREATE_NO_LOGO_ID

  return (
    <div className="space-y-1.5" data-testid="recreate-logo-picker">
      <p className="flex items-center gap-0.5 text-xs font-semibold text-[#444]">
        Logo
        <InfoGuide topic="logo" />
      </p>
      <div className="flex items-center gap-2">
        {selected?.previewUrl ? (
          <div className="h-9 w-9 overflow-hidden rounded-lg border border-[#EDEAE2] bg-[#FAFAF8] p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.previewUrl} alt="" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-[#DDD] text-[10px] text-[#999]">
            -
          </div>
        )}
        <select
          value={selectValue}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value
            if (next === RECREATE_NO_LOGO_ID) {
              onChange({ logoAssetId: null, logoVariantType: null })
              return
            }
            const logo = logos.find((item) => item.id === next)
            onChange({
              logoAssetId: next,
              logoVariantType: logo?.variantType ?? null,
            })
          }}
          className="min-w-0 flex-1 rounded-lg border border-[#EDEAE2] bg-white px-2 py-2 text-sm text-[#111]"
          data-testid="recreate-logo-select"
        >
          {logos.map((logo) => (
            <option key={logo.id} value={logo.id}>
              {logo.displayName}
              {logo.isPrimary ? ' - Primary' : ''}
              {` (${BRAND_LOGO_VARIANT_LABELS[logo.variantType]})`}
            </option>
          ))}
          <option value={RECREATE_NO_LOGO_ID}>No logo</option>
        </select>
      </div>
    </div>
  )
}
