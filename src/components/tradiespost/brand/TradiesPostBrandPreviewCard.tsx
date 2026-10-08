'use client'

import { TradiesPostCard } from '@/components/tradiespost/ui'
import { TradiesPostMeta, TradiesPostSectionTitle } from '@/components/tradiespost/ui/TradiesPostTypography'

type TradiesPostBrandPreviewProps = {
  businessName: string
  serviceArea?: string | null
  brandColor: string
  brandTextColor: string
  logoUrl?: string | null
}

export function TradiesPostBrandPreviewCard({
  businessName,
  serviceArea,
  brandColor,
  brandTextColor,
  logoUrl,
}: TradiesPostBrandPreviewProps) {
  const name = businessName.trim() || 'Your Business'
  const area = serviceArea?.trim() || 'Your service area'
  const logoSrc = logoUrl
    ? `/api/settings/logo?t=${encodeURIComponent(logoUrl)}`
    : null

  return (
    <TradiesPostCard padding="md" className="lg:sticky lg:top-6" data-testid="tp-brand-preview">
      <TradiesPostSectionTitle className="mb-1">Live preview</TradiesPostSectionTitle>
      <TradiesPostMeta className="mb-4">
        How your brand appears on a social post - updates as you edit.
      </TradiesPostMeta>

      <div className="mx-auto w-full max-w-[280px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md">
          {/* Post header bar */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ backgroundColor: brandColor, color: brandTextColor }}
          >
            {logoSrc ? (
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/90 p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-[10px] font-black">
                LOGO
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black leading-tight">{name}</p>
              <p className="truncate text-[10px] opacity-90">{area}</p>
            </div>
          </div>

          {/* Post image placeholder */}
          <div className="relative aspect-square bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div
                className="mb-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
                style={{ backgroundColor: brandColor, color: brandTextColor }}
              >
                Job complete
              </div>
              <p className="text-xs font-semibold text-zinc-600">Your branded post image</p>
              <p className="mt-1 text-[10px] text-zinc-400">Preview only - no AI generation</p>
            </div>
          </div>

          {/* Post footer */}
          <div className="space-y-2 p-3">
            <p className="text-[11px] leading-snug text-zinc-700">
              Quality work by <span className="font-bold">{name}</span> - trusted local tradies.
            </p>
            <div
              className="rounded-lg px-3 py-2 text-center text-[11px] font-black"
              style={{ backgroundColor: brandColor, color: brandTextColor }}
            >
              Call or message us today
            </div>
          </div>
        </div>
      </div>
    </TradiesPostCard>
  )
}
