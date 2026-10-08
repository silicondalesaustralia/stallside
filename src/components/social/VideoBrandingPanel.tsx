'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'
import {
  RecreateLogoPicker,
  type RecreateLogoSelection,
} from '@/components/social/RecreateLogoPicker'
import { SocialFontPreviewStyles } from '@/components/social/SocialFontPreviewStyles'
import { VideoHeadlinePreview } from '@/components/social/VideoHeadlinePreview'
import {
  VIDEO_HEADLINE_ALIGNS,
  VIDEO_HEADLINE_BACKGROUNDS,
  VIDEO_HEADLINE_SIZES,
  VIDEO_HEADLINE_WEIGHTS,
  VIDEO_LOGO_POSITIONS,
  VIDEO_LOGO_SIZES,
  VIDEO_TEXT_POSITIONS,
  type VideoHeadlineAlign,
  type VideoHeadlineBackground,
  type VideoHeadlineFontId,
  type VideoHeadlineSize,
  type VideoHeadlineWeight,
  type VideoLogoPosition,
  type VideoLogoSize,
  type VideoTextPosition,
} from '@/lib/social/videoBranding/types'
import {
  VIDEO_HEADLINE_ALIGN_LABELS,
  VIDEO_HEADLINE_BACKGROUND_LABELS,
  VIDEO_HEADLINE_SIZE_LABELS,
  VIDEO_HEADLINE_WEIGHT_LABELS,
  VIDEO_LOGO_POSITION_LABELS,
  VIDEO_TEXT_POSITION_LABELS,
} from '@/lib/social/videoBranding/safeZones'
import {
  VIDEO_OVERLAY_TEXT_MAX_CHARS,
  suggestVideoOverlayText,
} from '@/lib/social/videoBranding/validation'
import { RECREATE_LOGO_SIZE_LABELS } from '@/lib/social/recreateLogoPlacement'
import type { VideoBrandingConfig } from '@/lib/social/videoBranding/types'
import {
  VIDEO_HEADLINE_COLOR_SWATCHES,
  resolveVideoHeadlineStyle,
  wrapVideoHeadlineLines,
  videoHeadlineFontSizePx,
  type VideoHeadlineBusinessDefaults,
} from '@/lib/social/videoBranding/headlineStyle'
import { VideoHeadlineFontSelect } from '@/components/social/VideoHeadlineFontSelect'

export type VideoBrandingFormValue = RecreateLogoSelection & {
  logoPosition: VideoLogoPosition
  logoSize: VideoLogoSize
  overlayText: string
  textPosition: VideoTextPosition
  overlayTextFont: VideoHeadlineFontId
  overlayTextSize: VideoHeadlineSize
  overlayTextColor: string
  overlayTextWeight: VideoHeadlineWeight
  overlayTextAlign: VideoHeadlineAlign
  overlayTextBackground: VideoHeadlineBackground
}

const DOT_CLASS: Record<VideoLogoPosition, string> = {
  top_left: 'top-0.5 left-0.5',
  top_right: 'top-0.5 right-0.5',
  bottom_left: 'bottom-0.5 left-0.5',
  bottom_right: 'bottom-0.5 right-0.5',
}

export function defaultBrandingFormValue(
  config?: VideoBrandingConfig | null,
  businessDefaults?: VideoHeadlineBusinessDefaults,
): VideoBrandingFormValue {
  const style = resolveVideoHeadlineStyle(
    config ?? { overlayText: null, logoChoice: 'none', logoAssetId: null, logoPosition: null, logoSize: null, textPosition: null },
    businessDefaults,
  )

  return {
    logoAssetId: config?.logoAssetId ?? undefined,
    logoVariantType: null,
    logoPosition: config?.logoPosition ?? 'top_left',
    logoSize: config?.logoSize ?? 'medium',
    overlayText: config?.overlayText ?? '',
    textPosition: config?.textPosition ?? style.textPosition,
    overlayTextFont: style.fontId,
    overlayTextSize: style.size,
    overlayTextColor: style.color,
    overlayTextWeight: style.weight,
    overlayTextAlign: style.align,
    overlayTextBackground: style.background,
  }
}

function ColorSwatch({
  hex,
  label,
  selected,
  onSelect,
  disabled,
}: {
  hex: string
  label: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  const border = hex.toUpperCase() === '#FFFFFF' ? 'border-[#DDD]' : 'border-transparent'
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`min-h-[44px] min-w-[44px] rounded-lg border-2 p-1 ${selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-[#E0DDD5]'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`block h-8 w-8 rounded-md ${border}`} style={{ backgroundColor: hex }} />
    </button>
  )
}

export function VideoBrandingPanel({
  assetId,
  initialConfig,
  previewImageUrl,
  businessDefaults,
  suggestContext,
  processing,
  onSubmit,
  onClose,
}: {
  assetId: string
  initialConfig?: VideoBrandingConfig | null
  previewImageUrl?: string | null
  businessDefaults?: VideoHeadlineBusinessDefaults
  suggestContext?: {
    aboutText?: string | null
    jobTitle?: string | null
    jobSuburb?: string | null
  }
  processing?: boolean
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
  onClose?: () => void
}) {
  const [value, setValue] = useState<VideoBrandingFormValue>(() =>
    defaultBrandingFormValue(initialConfig, businessDefaults),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValue(defaultBrandingFormValue(initialConfig, businessDefaults))
    setError(null)
  }, [assetId, initialConfig, businessDefaults])

  const noLogo = value.logoAssetId === null
  const hasProcessed = Boolean(initialConfig)
  const overlayLen = value.overlayText.length

  const colorSwatches = useMemo(() => {
    const brand = businessDefaults?.brandColor?.trim()
    const swatches = [...VIDEO_HEADLINE_COLOR_SWATCHES]
    if (brand && /^#[0-9A-Fa-f]{6}$/.test(brand) && !swatches.some((s) => s.hex.toUpperCase() === brand.toUpperCase())) {
      swatches.push({ label: 'Brand', hex: brand.toUpperCase() })
    }
    return swatches
  }, [businessDefaults?.brandColor])

  const previewStyle = useMemo(
    () =>
      resolveVideoHeadlineStyle(
        {
          overlayText: value.overlayText,
          textPosition: value.textPosition,
          overlayTextFont: value.overlayTextFont,
          overlayTextSize: value.overlayTextSize,
          overlayTextColor: value.overlayTextColor,
          overlayTextWeight: value.overlayTextWeight,
          overlayTextAlign: value.overlayTextAlign,
          overlayTextBackground: value.overlayTextBackground,
          logoChoice: 'none',
          logoAssetId: null,
          logoPosition: null,
          logoSize: null,
        },
        businessDefaults,
      ),
    [value, businessDefaults],
  )

  const wrapWarning = useMemo(() => {
    if (!value.overlayText.trim()) return null
    const fontSize = videoHeadlineFontSizePx(value.overlayTextSize, 1280)
    return wrapVideoHeadlineLines(value.overlayText, {
      videoWidth: 720,
      fontSize,
      align: value.overlayTextAlign,
    }).warning
  }, [value.overlayText, value.overlayTextSize, value.overlayTextAlign])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        logoAssetId:
          value.logoAssetId === null
            ? 'none'
            : value.logoAssetId === undefined
              ? 'primary'
              : value.logoAssetId,
        logoPosition: noLogo ? undefined : value.logoPosition,
        logoSize: noLogo ? undefined : value.logoSize,
        overlayText: value.overlayText.trim() || undefined,
        textPosition: value.overlayText.trim() ? value.textPosition : undefined,
        overlayTextFont: value.overlayText.trim() ? value.overlayTextFont : undefined,
        overlayTextSize: value.overlayText.trim() ? value.overlayTextSize : undefined,
        overlayTextColor: value.overlayText.trim() ? value.overlayTextColor : undefined,
        overlayTextWeight: value.overlayText.trim() ? value.overlayTextWeight : undefined,
        overlayTextAlign: value.overlayText.trim() ? value.overlayTextAlign : undefined,
        overlayTextBackground: value.overlayText.trim() ? value.overlayTextBackground : undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start branding')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSuggestText() {
    const suggestion = suggestVideoOverlayText(suggestContext ?? {})
    if (suggestion) {
      setValue((prev) => ({ ...prev, overlayText: suggestion }))
    }
  }

  return (
    <div
      className="space-y-3 rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] p-3"
      data-testid={`video-branding-panel-${assetId}`}
    >
      <SocialFontPreviewStyles />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#888]">
          Brand video
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-semibold text-[#888] hover:text-[#555]"
          >
            Close
          </button>
        ) : null}
      </div>

      <RecreateLogoPicker
        value={value}
        onChange={(next) => setValue((prev) => ({ ...prev, ...next }))}
        disabled={processing || submitting}
      />

      <div className={noLogo || processing ? 'pointer-events-none opacity-50' : ''}>
        <p className="mb-1.5 text-xs font-semibold text-[#444]">Logo position</p>
        <div className="flex flex-wrap gap-1.5">
          {VIDEO_LOGO_POSITIONS.map((position) => {
            const selected = value.logoPosition === position
            return (
              <button
                key={position}
                type="button"
                disabled={noLogo || processing || submitting}
                title={VIDEO_LOGO_POSITION_LABELS[position]}
                aria-label={VIDEO_LOGO_POSITION_LABELS[position]}
                aria-pressed={selected}
                onClick={() => setValue((prev) => ({ ...prev, logoPosition: position }))}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-lg border p-1.5 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                    : 'border-[#E0DDD5] bg-white hover:border-indigo-200'
                }`}
                data-testid={`video-logo-position-${position}`}
              >
                <div className="relative h-8 w-8 rounded border border-[#DDD] bg-[#F5F5F2]">
                  <span
                    className={`absolute h-2 w-2 rounded-sm bg-indigo-600 ${DOT_CLASS[position]}`}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className={noLogo || processing ? 'pointer-events-none opacity-50' : ''}>
        <p className="mb-1.5 text-xs font-semibold text-[#444]">Logo size</p>
        <div className="flex gap-1.5">
          {VIDEO_LOGO_SIZES.map((size) => {
            const selected = value.logoSize === size
            return (
              <button
                key={size}
                type="button"
                disabled={noLogo || processing || submitting}
                onClick={() => setValue((prev) => ({ ...prev, logoSize: size }))}
                className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-[#E0DDD5] bg-white text-[#555] hover:border-indigo-200'
                }`}
                data-testid={`video-logo-size-${size}`}
              >
                {RECREATE_LOGO_SIZE_LABELS[size]}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#444]">Video headline</p>
          {suggestContext ? (
            <button
              type="button"
              disabled={processing || submitting}
              onClick={handleSuggestText}
              className="inline-flex min-h-[44px] items-center gap-1 text-[11px] font-semibold text-indigo-600"
              data-testid={`video-suggest-overlay-${assetId}`}
            >
              <Wand2 className="h-3 w-3" />
              Suggest text
            </button>
          ) : null}
        </div>
        <input
          type="text"
          value={value.overlayText}
          maxLength={VIDEO_OVERLAY_TEXT_MAX_CHARS}
          disabled={processing || submitting}
          placeholder="NEW PUMP INSTALLED"
          onChange={(e) =>
            setValue((prev) => ({
              ...prev,
              overlayText: e.target.value.slice(0, VIDEO_OVERLAY_TEXT_MAX_CHARS),
            }))
          }
          className="w-full rounded-xl border border-[#EDEAE2] bg-white px-3 py-2.5 text-sm text-[#333]"
          data-testid={`video-overlay-text-${assetId}`}
        />
        <p className="mt-1 text-[10px] text-[#AAA]">
          Short text shown on your video - separate from your social caption. {overlayLen}/
          {VIDEO_OVERLAY_TEXT_MAX_CHARS}
        </p>
        {wrapWarning ? (
          <p className="mt-1 text-[10px] font-medium text-amber-700">{wrapWarning}</p>
        ) : null}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-[#444]">Font</p>
        <VideoHeadlineFontSelect
          assetId={assetId}
          value={value.overlayTextFont}
          disabled={processing || submitting}
          onChange={(overlayTextFont) =>
            setValue((prev) => ({ ...prev, overlayTextFont }))
          }
        />
      </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#444]">Size</p>
            <div className="flex gap-1.5">
              {VIDEO_HEADLINE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={processing || submitting}
                  onClick={() => setValue((prev) => ({ ...prev, overlayTextSize: size }))}
                  className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                    value.overlayTextSize === size
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                      : 'border-[#E0DDD5] bg-white text-[#555]'
                  }`}
                  data-testid={`video-headline-size-${size}`}
                >
                  {VIDEO_HEADLINE_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#444]">Colour</p>
            <div className="flex flex-wrap gap-1.5">
              {colorSwatches.map((swatch) => (
                <ColorSwatch
                  key={swatch.hex}
                  hex={swatch.hex}
                  label={swatch.label}
                  selected={value.overlayTextColor.toUpperCase() === swatch.hex.toUpperCase()}
                  disabled={processing || submitting}
                  onSelect={() =>
                    setValue((prev) => ({ ...prev, overlayTextColor: swatch.hex.toUpperCase() }))
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#444]">Weight</p>
            <div className="flex gap-1.5">
              {VIDEO_HEADLINE_WEIGHTS.map((weight) => (
                <button
                  key={weight}
                  type="button"
                  disabled={processing || submitting}
                  onClick={() => setValue((prev) => ({ ...prev, overlayTextWeight: weight }))}
                  className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                    value.overlayTextWeight === weight
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                      : 'border-[#E0DDD5] bg-white text-[#555]'
                  }`}
                  data-testid={`video-headline-weight-${weight}`}
                >
                  {VIDEO_HEADLINE_WEIGHT_LABELS[weight]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#444]">Alignment</p>
            <div className="flex gap-1.5">
              {VIDEO_HEADLINE_ALIGNS.map((align) => (
                <button
                  key={align}
                  type="button"
                  disabled={processing || submitting}
                  onClick={() => setValue((prev) => ({ ...prev, overlayTextAlign: align }))}
                  className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                    value.overlayTextAlign === align
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                      : 'border-[#E0DDD5] bg-white text-[#555]'
                  }`}
                  data-testid={`video-headline-align-${align}`}
                >
                  {VIDEO_HEADLINE_ALIGN_LABELS[align]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#444]">Position</p>
            <div className="flex gap-1.5">
              {VIDEO_TEXT_POSITIONS.map((position) => (
                <button
                  key={position}
                  type="button"
                  disabled={processing || submitting}
                  onClick={() => setValue((prev) => ({ ...prev, textPosition: position }))}
                  className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                    value.textPosition === position
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                      : 'border-[#E0DDD5] bg-white text-[#555]'
                  }`}
                  data-testid={`video-text-position-${position}`}
                >
                  {VIDEO_TEXT_POSITION_LABELS[position]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#444]">Background</p>
            <div className="flex gap-1.5">
              {VIDEO_HEADLINE_BACKGROUNDS.map((background) => (
                <button
                  key={background}
                  type="button"
                  disabled={processing || submitting}
                  onClick={() =>
                    setValue((prev) => ({ ...prev, overlayTextBackground: background }))
                  }
                  className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                    value.overlayTextBackground === background
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                      : 'border-[#E0DDD5] bg-white text-[#555]'
                  }`}
                  data-testid={`video-headline-background-${background}`}
                >
                  {VIDEO_HEADLINE_BACKGROUND_LABELS[background]}
                </button>
              ))}
            </div>
          </div>

      {value.overlayText.trim() ? (
        <VideoHeadlinePreview
          imageUrl={previewImageUrl ?? null}
          headline={value.overlayText}
          style={previewStyle}
          logoPosition={noLogo ? null : value.logoPosition}
          hasLogo={!noLogo}
        />
      ) : (
        <p className="text-[10px] leading-relaxed text-[#AAA]">
          Add headline text above to see a live style preview.
        </p>
      )}

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={processing || submitting}
        onClick={() => void handleSubmit()}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#FFD700] px-3 py-2.5 text-xs font-bold text-black disabled:opacity-50"
        data-testid={`video-brand-submit-${assetId}`}
      >
        {submitting || processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing branded video…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {hasProcessed ? 'Update branded video' : 'Create branded video'}
          </>
        )}
      </button>
    </div>
  )
}
