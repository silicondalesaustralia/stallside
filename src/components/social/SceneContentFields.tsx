'use client'

import {
  SCENE_CTA_MAX,
  SCENE_HEADLINE_MAX,
  SCENE_TAGLINE_MAX,
  type SceneContent,
} from '@/lib/social/sceneContent'

export function SceneContentFields({
  content,
  onChange,
}: {
  content: SceneContent
  onChange: (next: SceneContent) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-[#666]">Headline</label>
        <input
          type="text"
          value={content.headline}
          maxLength={SCENE_HEADLINE_MAX}
          onChange={(e) => onChange({ ...content, headline: e.target.value })}
          className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          placeholder="Your business name or main message"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[#666]">Tagline</label>
        <input
          type="text"
          value={content.tagline}
          maxLength={SCENE_TAGLINE_MAX}
          onChange={(e) => onChange({ ...content, tagline: e.target.value })}
          className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          placeholder="Services or short supporting line"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[#666]">Call to action</label>
        <input
          type="text"
          value={content.cta}
          maxLength={SCENE_CTA_MAX}
          onChange={(e) => onChange({ ...content, cta: e.target.value })}
          className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          placeholder="Call us today"
        />
      </div>
    </div>
  )
}
