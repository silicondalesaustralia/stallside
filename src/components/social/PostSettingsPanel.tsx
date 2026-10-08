'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { InfoGuide } from '@/components/ui/InfoGuide'
import { SocialTextStyleEditor } from '@/components/social/SocialTextStyleEditor'
import { LogoCornerPicker } from '@/components/social/LogoCornerPicker'
import { SceneStackLayoutPicker } from '@/components/social/SceneStackLayoutPicker'
import {
  parseSocialLogoCorner,
  type SocialLogoCorner,
} from '@/lib/social/socialLogoCorner'
import type { SceneStackLayout } from '@/lib/social/sceneStackLayout'
import {
  isAutoSocialColor,
  parseSocialTextStyles,
  type SocialElementStyle,
  type SocialTextElement,
  type SocialTextStyles,
} from '@/lib/social/socialTextStyle'

export interface PostSettingsBusiness {
  id: string
  name?: string | null
  social_brand_voice?: string | null
  social_default_cta?: string | null
  social_auto_prompt?: boolean | null
  social_text_styles?: SocialTextStyles | null
  social_logo_corner?: string | null
}

export function PostSettingsPanel({
  business,
  onUpdate,
  variant = 'stitchedup',
}: {
  business: PostSettingsBusiness
  onUpdate: (patch: Partial<PostSettingsBusiness>) => void
  variant?: 'stitchedup' | 'tradiespost'
}) {
  const isTradiesPost = variant === 'tradiespost'
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const textStyles = parseSocialTextStyles(business.social_text_styles)
  const logoCorner = parseSocialLogoCorner(business.social_logo_corner)
  const [layoutDraft, setLayoutDraft] = useState<SceneStackLayout | null>(null)

  useEffect(() => {
    setLayoutDraft(null)
  }, [business.social_text_styles])

  const stackLayout = layoutDraft ?? {
    stackAnchor: textStyles.stackAnchor,
    stackOffsetX: textStyles.stackOffsetX,
    stackOffsetY: textStyles.stackOffsetY,
  }

  async function saveLogoCorner(corner: SocialLogoCorner) {
    const supabase = createClient()
    await supabase.from('businesses').update({ social_logo_corner: corner }).eq('id', business.id)
    onUpdate({ social_logo_corner: corner })
    toast('Saved', 'success')
  }

  async function saveElement(element: SocialTextElement, next: SocialElementStyle) {
    const current = parseSocialTextStyles(business.social_text_styles)
    const storedColor = isAutoSocialColor(next.color) ? null : next.color
    const merged = {
      ...current,
      [element]: { ...next, color: storedColor },
    }
    const supabase = createClient()
    await supabase.from('businesses').update({ social_text_styles: merged }).eq('id', business.id)
    onUpdate({ social_text_styles: merged })
    toast('Saved', 'success')
  }

  async function saveStackLayout(next: SceneStackLayout) {
    const current = parseSocialTextStyles(business.social_text_styles)
    const merged = { ...current, ...next }
    const supabase = createClient()
    await supabase.from('businesses').update({ social_text_styles: merged }).eq('id', business.id)
    onUpdate({ social_text_styles: merged })
    toast('Saved', 'success')
  }

  return (
    <div
      className={`mb-6 overflow-hidden rounded-xl border bg-white ${
        isTradiesPost ? 'border-zinc-200' : 'border-[#EDEAE2]'
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2 px-4 py-3 hover:bg-[#FAFAF7] transition-colors">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center justify-between text-left"
        >
          <span className="flex min-w-0 flex-col items-start gap-0.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#333]">
              <Settings className="h-4 w-4 text-[#888]" />
              {isTradiesPost ? 'Post defaults' : 'Post defaults'}
            </span>
            <span className="pl-6 text-[11px] font-normal text-[#888]">
              {isTradiesPost
                ? 'Optional - brand voice, CTA and layout defaults for new posts.'
                : 'Defaults used when creating new social posts.'}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#888] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <InfoGuide topic="postDefaults" />
      </div>

      {open && (
        <div className="border-t border-[#F0EDE5] px-4 py-4 space-y-4 bg-[#FAFAF7]">
          <div>
            <label className="mb-1.5 flex items-center gap-0.5 text-xs font-medium text-[#666]">
              Default brand voice
              <InfoGuide topic="brandVoice" />
            </label>
            <select
              value={business.social_brand_voice || 'professional'}
              onChange={async (e) => {
                const supabase = createClient()
                await supabase.from('businesses').update({ social_brand_voice: e.target.value }).eq('id', business.id)
                onUpdate({ social_brand_voice: e.target.value })
                toast('Saved', 'success')
              }}
              className="w-full rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FFD700]"
            >
              <option value="professional">🎯 Professional - clear and trustworthy</option>
              <option value="casual">😊 Casual - friendly and relatable</option>
              <option value="punchy">⚡ Punchy - short and bold</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-0.5 text-xs font-medium text-[#666]">
              Default call to action
              <InfoGuide topic="defaultCta" />
            </label>
            <input
              type="text"
              key={business.social_default_cta ?? 'default'}
              defaultValue={business.social_default_cta || 'Call us for a free quote'}
              onBlur={async (e) => {
                const supabase = createClient()
                await supabase.from('businesses').update({ social_default_cta: e.target.value }).eq('id', business.id)
                onUpdate({ social_default_cta: e.target.value })
                toast('Saved', 'success')
              }}
              placeholder="e.g. Call us for a free quote"
              className="w-full rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#666] block mb-2">Default logo position</label>
            <LogoCornerPicker value={logoCorner} onChange={(c) => { void saveLogoCorner(c) }} />
            <p className="mt-1.5 text-[10px] text-[#AAA]">
              Where your logo appears on hybrid-render posts (scene, infographic, quote card).
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-[#666] block mb-2">Default text position</label>
            <SceneStackLayoutPicker
              value={stackLayout}
              onChange={setLayoutDraft}
              onCommit={(next) => { void saveStackLayout(next) }}
            />
            <p className="mt-1.5 text-[10px] text-[#AAA]">
              Scene posts only - headline, tagline, and the button move together.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-[#666] block mb-2">Default text styles</label>
            <SocialTextStyleEditor
              styles={textStyles}
              onChange={(element, next) => { void saveElement(element, next) }}
              fontPreviewPhrase={business.name}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white border border-[#E0DDD5] px-3 py-2.5">
            <div>
              <p className="flex items-center gap-0.5 text-sm font-medium text-[#444]">
                Auto-prompt after job paid
                <InfoGuide topic="autoPrompt" />
              </p>
              <p className="text-xs text-[#888] mt-0.5">Show a prompt to create a social post when a job is marked paid</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const newVal = !(business.social_auto_prompt ?? true)
                const supabase = createClient()
                await supabase.from('businesses').update({ social_auto_prompt: newVal }).eq('id', business.id)
                onUpdate({ social_auto_prompt: newVal })
                toast(newVal ? 'Auto-prompt on' : 'Auto-prompt off', 'success')
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                (business.social_auto_prompt ?? true) ? 'bg-[#FFD700]' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                (business.social_auto_prompt ?? true) ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
