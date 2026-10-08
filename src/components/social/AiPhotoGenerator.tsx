'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import {
  AI_IMAGE_STYLES,
  MAX_AI_IMAGE_CUSTOM_PROMPT,
  MAX_AI_IMAGE_EXTRA_DETAIL,
  MAX_AI_IMAGE_REGENERATES,
  type AiImagePurpose,
  type AiImageStyleId,
} from '@/lib/social/aiImageStyles'
import type { AiImageSceneOption } from '@/lib/social/aiImageStyles'
import { aiPurposeLabel } from '@/lib/social/composeAiPurpose'
import { formatAiPhotoGenerateCreditLine } from '@/lib/social/composeCreditEstimate'
import { ChoiceButtons } from '@/components/social/ChoiceButtons'

export type AiPhotoGeneratorVariant = 'guided' | 'custom'

export function AiPhotoGenerator({
  variant,
  derivedPurpose,
  selectedUrl,
  onPhotoSelect,
  onPhotoGenerated,
  businessName,
  tradeCategory,
  jobDescription,
  brandColor,
  sessionKey,
}: {
  /** Guided = Scene + Style from Step 1 purpose; custom = free-text prompt flow. */
  variant:           AiPhotoGeneratorVariant
  /** From postTaxonomy aiPurpose - shown read-only in guided mode. */
  derivedPurpose:    AiImagePurpose
  selectedUrl:       string
  onPhotoSelect:     (url: string) => void
  /** Fired after a successful billed generate (render credit consumed). */
  onPhotoGenerated?: () => void
  businessName:      string
  tradeCategory:     string
  jobDescription:    string
  brandColor:        string | null
  sessionKey:        number
}) {
  const [scenes, setScenes] = useState<AiImageSceneOption[]>([])
  const [scenesLoading, setScenesLoading] = useState(true)
  const [scenesError, setScenesError] = useState<string | null>(null)

  const [sceneId, setSceneId] = useState<string | null>(null)
  const [style, setStyle] = useState<AiImageStyleId | null>(null)
  const [extraDetail, setExtraDetail] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [editablePrompt, setEditablePrompt] = useState('')

  const [expandingPrompt, setExpandingPrompt] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandError, setExpandError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [photoResultUrl, setPhotoResultUrl] = useState<string | null>(null)
  const [photoGenerateCount, setPhotoGenerateCount] = useState(0)

  const maxGenerations = 1 + MAX_AI_IMAGE_REGENERATES
  const canGenerate = photoGenerateCount < maxGenerations
  const remaining = maxGenerations - photoGenerateCount

  const resetFlow = useCallback(() => {
    setSceneId(null)
    setStyle(null)
    setExtraDetail('')
    setCustomPrompt('')
    setEditablePrompt('')
    setExpandError(null)
    setGenerateError(null)
    setPhotoResultUrl(null)
    setPhotoGenerateCount(0)
  }, [])

  useEffect(() => {
    resetFlow()
  }, [sessionKey, derivedPurpose, variant, resetFlow])

  useEffect(() => {
    let cancelled = false
    setScenesLoading(true)
    setScenesError(null)
    fetch('/api/social/ai-image/scenes')
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load scenes')
        if (!cancelled) setScenes(json.scenes ?? [])
      })
      .catch((err) => {
        if (!cancelled) {
          setScenesError(err instanceof Error ? err.message : 'Failed to load scenes')
        }
      })
      .finally(() => {
        if (!cancelled) setScenesLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filteredScenes = scenes.filter((s) => s.purpose === derivedPurpose)

  function buildContextPayload(): Record<string, string | undefined> {
    return {
      mode:           'photo',
      tradeCategory,
      businessName,
      jobDescription: jobDescription || undefined,
      brandColor:     brandColor || undefined,
    }
  }

  async function runExpandPrompt() {
    if (!customPrompt.trim() || expandingPrompt || generating) return

    setExpandingPrompt(true)
    setExpandError(null)
    try {
      const res = await fetch('/api/social/ai-image/expand-prompt', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...buildContextPayload(),
          customPrompt: customPrompt.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.expandedPrompt) {
        throw new Error(json.error || 'Prompt generation failed')
      }
      setEditablePrompt(String(json.expandedPrompt).trim())
    } catch (err) {
      setExpandError(err instanceof Error ? err.message : 'Prompt generation failed')
    } finally {
      setExpandingPrompt(false)
    }
  }

  function useRawPromptAsIs() {
    const raw = customPrompt.trim()
    if (!raw) return
    setEditablePrompt(raw)
    setExpandError(null)
  }

  async function runGenerateImage() {
    if (!editablePrompt.trim() || generating || !canGenerate) return

    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch('/api/social/ai-image/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...buildContextPayload(),
          finalPrompt: editablePrompt.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        if (json.code === 'no_render_credits') {
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || 'Generation failed')
      }
      setPhotoResultUrl(json.url)
      setPhotoGenerateCount((c) => c + 1)
      onPhotoSelect(json.url)
      onPhotoGenerated?.()
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function runGenerateGuided() {
    if (!guidedReady || generating || !canGenerate) return

    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch('/api/social/ai-image/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...buildContextPayload(),
          purpose:     derivedPurpose,
          sceneId:     sceneId!,
          style:       style!,
          extraDetail: extraDetail.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        if (json.code === 'no_render_credits') {
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || 'Generation failed')
      }
      setPhotoResultUrl(json.url)
      setPhotoGenerateCount((c) => c + 1)
      onPhotoSelect(json.url)
      onPhotoGenerated?.()
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const guidedReady = !!(sceneId && style)
  const customRoughReady = !!customPrompt.trim()
  const customImageReady = !!editablePrompt.trim()
  const busy = expandingPrompt || generating
  const resultUrl = photoResultUrl

  if (scenesLoading) {
    return (
      <p className="text-xs text-[#888] flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading options…
      </p>
    )
  }

  if (scenesError) {
    return <p className="text-xs text-red-600">{scenesError}</p>
  }

  return (
    <div className="space-y-3">
      {variant === 'guided' ? (
        <>
          <div className="rounded-lg border border-[#EDEAE2] bg-[#FAFAF8] px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#999]">Purpose</p>
            <p className="text-xs font-semibold text-[#333]">{aiPurposeLabel(derivedPurpose)}</p>
            <p className="mt-0.5 text-[10px] text-[#AAA]">
              From your post type in Step 1 - scene options match this purpose.
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#999]">Scene</p>
            {filteredScenes.length === 0 ? (
              <p className="text-xs text-[#888]">No scenes available for this purpose.</p>
            ) : (
              <ChoiceButtons
                options={filteredScenes.map((s) => ({ id: s.id, label: s.scene_label }))}
                value={sceneId}
                onChange={(id) => { setSceneId(id); setGenerateError(null) }}
                disabled={busy}
              />
            )}
          </div>

          {sceneId && (
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#999]">Style</p>
              <ChoiceButtons
                options={AI_IMAGE_STYLES.map((s) => ({ id: s.id, label: s.label }))}
                value={style}
                onChange={(id) => { setStyle(id); setGenerateError(null) }}
                disabled={busy}
              />
            </div>
          )}

          {style && (
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[#999]">
                Add extra detail (optional)
              </label>
              <input
                type="text"
                value={extraDetail}
                maxLength={MAX_AI_IMAGE_EXTRA_DETAIL}
                disabled={busy}
                placeholder="e.g. show a red toolbox or include our van in the background"
                onChange={(e) => setExtraDetail(e.target.value.slice(0, MAX_AI_IMAGE_EXTRA_DETAIL))}
                className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-xs disabled:opacity-60"
              />
              <p className="mt-0.5 text-[10px] text-[#AAA]">
                Added to your prompt - does not replace scene or style. {extraDetail.length}/{MAX_AI_IMAGE_EXTRA_DETAIL}
              </p>
            </div>
          )}

          {guidedReady && canGenerate && (
            <>
            <button
              type="button"
              disabled={generating}
              onClick={runGenerateGuided}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFD700] px-3 py-2 text-xs font-black text-black hover:bg-[#e6bc00] disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {resultUrl ? 'Regenerate photo' : 'Generate photo'}
                  {photoGenerateCount > 0 && (
                    <span className="font-semibold text-[#555]">({remaining} left)</span>
                  )}
                </>
              )}
            </button>
            <p className="text-[10px] text-[#888]">{formatAiPhotoGenerateCreditLine()}</p>
            </>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[#999]">
              Describe the image you want
            </label>
            <textarea
              value={customPrompt}
              maxLength={MAX_AI_IMAGE_CUSTOM_PROMPT}
              disabled={busy}
              rows={4}
              placeholder="e.g. modern kitchen renovation, white cabinets, warm lighting"
              onChange={(e) => setCustomPrompt(e.target.value.slice(0, MAX_AI_IMAGE_CUSTOM_PROMPT))}
              className="w-full resize-y rounded-lg border border-[#E0DDD5] px-3 py-2 text-xs leading-relaxed disabled:opacity-60 min-h-[96px]"
            />
            <p className="mt-0.5 text-[10px] text-[#AAA]">
              Your rough idea - {customPrompt.length}/{MAX_AI_IMAGE_CUSTOM_PROMPT} characters
            </p>
          </div>

          {customRoughReady && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={runExpandPrompt}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-xs font-black text-black hover:border-[#CCC] disabled:opacity-60"
              >
                {expandingPrompt ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating prompt…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {editablePrompt.trim() ? 'Re-generate prompt' : 'Generate prompt'}
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={useRawPromptAsIs}
                className="text-[10px] font-semibold text-[#888] underline hover:text-black disabled:opacity-60"
              >
                Skip, use my text as-is
              </button>
            </div>
          )}

          {expandError && (
            <p className="text-xs text-red-600">{expandError}</p>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[#999]">
              Your AI-written prompt (edit if you like)
            </label>
            <textarea
              value={editablePrompt}
              maxLength={MAX_AI_IMAGE_CUSTOM_PROMPT}
              disabled={busy}
              rows={6}
              placeholder="Generate a prompt above, or skip to use your own text"
              onChange={(e) => setEditablePrompt(e.target.value.slice(0, MAX_AI_IMAGE_CUSTOM_PROMPT))}
              className="w-full resize-y rounded-lg border border-[#E0DDD5] px-3 py-2 text-xs leading-relaxed disabled:opacity-60 min-h-[140px]"
            />
            {editablePrompt.trim() && (
              <p className="mt-0.5 text-[10px] text-[#AAA]">
                {editablePrompt.length}/{MAX_AI_IMAGE_CUSTOM_PROMPT} characters
              </p>
            )}
          </div>

          {customImageReady && canGenerate && (
            <>
            <button
              type="button"
              disabled={generating}
              onClick={runGenerateImage}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFD700] px-3 py-2 text-xs font-black text-black hover:bg-[#e6bc00] disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating image…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {resultUrl ? 'Regenerate photo' : 'Generate photo'}
                  {photoGenerateCount > 0 && (
                    <span className="font-semibold text-[#555]">({remaining} left)</span>
                  )}
                </>
              )}
            </button>
            <p className="text-[10px] text-[#888]">{formatAiPhotoGenerateCreditLine()}</p>
            </>
          )}
        </div>
      )}

      {!canGenerate && resultUrl && (
        <p className="text-xs text-[#888]">Generation limit reached (3 regenerates used).</p>
      )}

      {generateError && (
        <p className="text-xs text-red-600">{generateError}</p>
      )}

      {resultUrl && (
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#999]">Result</p>
          <button
            type="button"
            onClick={() => {
              if (selectedUrl !== resultUrl) onPhotoSelect(resultUrl)
            }}
            className={`h-24 w-24 rounded-lg overflow-hidden border-2 ${
              selectedUrl === resultUrl
                ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40'
                : 'border-[#EDEAE2] hover:border-[#CCC]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="AI generated" className="h-full w-full object-cover" />
          </button>
        </div>
      )}
    </div>
  )
}
