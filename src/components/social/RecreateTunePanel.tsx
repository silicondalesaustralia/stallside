'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { InspirationContentEditor } from '@/components/social/InspirationContentEditor'
import { LogoCornerPicker } from '@/components/social/LogoCornerPicker'
import { SceneStackLayoutPicker } from '@/components/social/SceneStackLayoutPicker'
import { SocialTextStyleEditor } from '@/components/social/SocialTextStyleEditor'
import type { CreateTabBusiness } from '@/components/social/CreateTab'
import type { InspirationVariantPreview } from '@/lib/social/inspirationTypes'
import { MAX_AI_IMAGE_EXTRA_DETAIL } from '@/lib/social/aiImageStyles'
import { readApiJson } from '@/lib/http/readApiJson'
import { useRenderCredits } from '@/hooks/useRenderCredits'
import {
  parseSocialLogoCorner,
  type SocialLogoCorner,
} from '@/lib/social/socialLogoCorner'
import type { SceneStackLayout } from '@/lib/social/sceneStackLayout'
import {
  parseSocialTextStyles,
  type SocialElementStyle,
  type SocialTextElement,
  type SocialTextStyles,
} from '@/lib/social/socialTextStyle'

export type TunedVariantState = {
  content: unknown
  textStyles: SocialTextStyles
  logoCorner: SocialLogoCorner
  showLogo: boolean
  imageUrl: string
  backgroundUrl: string | null
}

export { shouldShowRecreateTune } from '@/lib/social/recreateTuneVisibility'

export function RecreateTunePanel({
  business,
  variant,
  tuned,
  onChange,
  onFinalize,
  finalizing,
}: {
  business: CreateTabBusiness
  variant: InspirationVariantPreview
  tuned: TunedVariantState
  onChange: (next: TunedVariantState) => void
  onFinalize: () => void
  finalizing: boolean
}) {
  const { refresh: refreshCredits } = useRenderCredits()
  const hasLogo = Boolean(business.logo_url?.trim())
  const [overlayBusy, setOverlayBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const skipFirstOverlay = useRef(true)
  const tunedRef = useRef(tuned)
  tunedRef.current = tuned

  const patch = useCallback(
    (partial: Partial<TunedVariantState>) => {
      onChange({ ...tunedRef.current, ...partial })
    },
    [onChange],
  )

  const overlayBody = useCallback(() => {
    const current = tunedRef.current
    return {
      format: variant.format,
      preset: variant.infographicPreset,
      platform: 'instagram',
      photoSource: variant.photoSource,
      photoUrl: current.backgroundUrl,
      content: current.content,
      logoCorner: current.logoCorner,
      textStyles: current.textStyles,
      showLogo: current.showLogo && hasLogo,
    }
  }, [hasLogo, variant.format, variant.infographicPreset, variant.photoSource])

  const refreshOverlay = useCallback(async () => {
    if (variant.visualPath === 'reference_recreation') return
    const current = tunedRef.current
    if (variant.photoSource !== 'none' && !current.backgroundUrl) return
    setOverlayBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/social/inspiration-overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overlayBody()),
      })
      const json = await readApiJson<{ imageUrl?: string; error?: string }>(res)
      if (!res.ok) throw new Error(json.error || 'Could not refresh preview')
      if (json.imageUrl) patch({ imageUrl: json.imageUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh preview')
    } finally {
      setOverlayBusy(false)
    }
  }, [overlayBody, patch, variant.photoSource])

  useEffect(() => {
    if (skipFirstOverlay.current) {
      skipFirstOverlay.current = false
      return
    }
    const timer = window.setTimeout(() => {
      void refreshOverlay()
    }, 550)
    return () => window.clearTimeout(timer)
  }, [
    tuned.content,
    tuned.textStyles,
    tuned.logoCorner,
    tuned.showLogo,
    refreshOverlay,
  ])

  async function refinePhoto() {
    const prompt = refinePrompt.trim()
    if (!prompt) {
      setError('Describe the photo you want - e.g. tools on a bench, no faces.')
      return
    }
    setPhotoBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/social/inspiration-photo-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...overlayBody(),
          refinePrompt: prompt,
        }),
      })
      const json = await readApiJson<{
        imageUrl?: string
        backgroundUrl?: string | null
        error?: string
        usedFreeTrial?: boolean
      }>(res)
      if (!res.ok) throw new Error(json.error || 'Photo refine failed')
      patch({
        imageUrl: json.imageUrl || tuned.imageUrl,
        backgroundUrl: json.backgroundUrl ?? tuned.backgroundUrl,
      })
      await refreshCredits()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo refine failed')
    } finally {
      setPhotoBusy(false)
    }
  }

  function handleTextStyleChange(element: SocialTextElement, next: SocialElementStyle) {
    patch({
      textStyles: { ...tuned.textStyles, [element]: next },
    })
  }

  function handleStackLayoutChange(next: SceneStackLayout) {
    patch({
      textStyles: { ...tuned.textStyles, ...next },
    })
  }

  const sceneLike = variant.format === 'scene'

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#666]">
          Tune this variant
        </p>
        <p className="mt-1 text-xs text-[#666] leading-relaxed">
          Same photo. Change the words, logo, and type - the preview updates free.
          Saving uses 1 render credit.
        </p>
      </div>

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tuned.imageUrl}
          alt={variant.label}
          className="mx-auto max-h-96 rounded-lg border border-[#EDEAE2]"
        />
        {overlayBusy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-[#666]">Words</p>
        <InspirationContentEditor
          format={variant.format}
          preset={variant.infographicPreset}
          content={tuned.content}
          onChange={(content) => patch({ content })}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-[#666]">Logo</p>
        {hasLogo ? (
          <>
            <label className="mb-3 flex items-center gap-2 text-sm text-[#333]">
              <input
                type="checkbox"
                checked={tuned.showLogo}
                onChange={(e) => patch({ showLogo: e.target.checked })}
              />
              Show logo on this post
            </label>
            {tuned.showLogo && (
              <LogoCornerPicker
                value={tuned.logoCorner}
                onChange={(logoCorner) => patch({ logoCorner })}
                disabled={overlayBusy || photoBusy}
              />
            )}
          </>
        ) : (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            No logo on this business yet.{' '}
            <Link href="/dashboard/social/brand" className="font-semibold underline">
              Add a logo in Settings
            </Link>{' '}
            before you spend a credit if you want it on the finished post.
          </p>
        )}
      </div>

      {sceneLike && (
        <>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#666]">Text position</p>
            <SceneStackLayoutPicker
              value={{
                stackAnchor: tuned.textStyles.stackAnchor,
                stackOffsetX: tuned.textStyles.stackOffsetX,
                stackOffsetY: tuned.textStyles.stackOffsetY,
              }}
              onChange={handleStackLayoutChange}
              disabled={overlayBusy || photoBusy}
            />
            <p className="mt-1.5 text-[10px] text-[#AAA]">
              Moves headline, tagline, and the button together. Preview updates free.
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#666]">Font & colour</p>
            <SocialTextStyleEditor
              inline
              styles={tuned.textStyles}
              onChange={handleTextStyleChange}
              elements={['headline', 'tagline']}
              fontPreviewPhrase={business.name}
              hint="Preview updates free. This does not change your Social defaults."
            />
          </div>
        </>
      )}

      <div>
        <p className="mb-1 text-xs font-semibold text-[#666]">Photo only (1 credit)</p>
        <p className="mb-2 text-[11px] text-[#888]">
          Regenerates the background. Your words stay as typed. Example: “More tools on a
          bench, no faces” or “Van in an Australian driveway”.
        </p>
        <textarea
          value={refinePrompt}
          maxLength={MAX_AI_IMAGE_EXTRA_DETAIL}
          rows={2}
          onChange={(e) => setRefinePrompt(e.target.value)}
          className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          placeholder="More tools on a bench, no faces"
        />
        <button
          type="button"
          disabled={photoBusy || overlayBusy || !refinePrompt.trim()}
          onClick={() => void refinePhoto()}
          className="mt-2 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50"
        >
          {photoBusy ? 'Regenerating photo…' : 'Regenerate photo (1 credit)'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        disabled={finalizing || overlayBusy || photoBusy}
        onClick={onFinalize}
        className="w-full rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-black shadow-md hover:bg-yellow-400 disabled:opacity-50"
      >
        {finalizing ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving branded post…
          </span>
        ) : (
          'Use this variant (1 credit)'
        )}
      </button>
    </div>
  )
}

export function initialTunedState(
  variant: InspirationVariantPreview,
  business: CreateTabBusiness,
): TunedVariantState {
  return {
    content: variant.content,
    textStyles: parseSocialTextStyles(business.social_text_styles),
    logoCorner: parseSocialLogoCorner(business.social_logo_corner),
    showLogo: Boolean(business.logo_url?.trim()),
    imageUrl: variant.imageUrl,
    backgroundUrl: variant.backgroundUrl ?? null,
  }
}
