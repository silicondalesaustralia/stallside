'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import {
  SOCIAL_PUBLISH_PLATFORMS,
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'

type Props = {
  platforms: SocialPublishPlatform[]
  businessName: string
  logoUrl: string | null
  imageUrl: string | null
  caption: string
  headline: string
}

export function ComposerPreview({ platforms, businessName, logoUrl, imageUrl, caption, headline }: Props) {
  const tabs = platforms.length ? platforms : SOCIAL_PUBLISH_PLATFORMS
  const [active, setActive] = useState<SocialPublishPlatform>(tabs[0])
  const current = tabs.includes(active) ? active : tabs[0]
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white" data-testid="composer-preview">
      <div className="flex gap-1 border-b border-[#F0F0F0] p-1.5">
        {tabs.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setActive(p)}
            className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold ${
              current === p ? 'bg-[#FFF8DB] text-[#18181B]' : 'text-zinc-500'
            }`}
          >
            {SOCIAL_PUBLISH_PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5">
        {logoUrl && !logoFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            onError={() => setLogoFailed(true)}
            className="h-8 w-8 rounded-full border border-[#E4E4E7] object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[#F5C518]" />
        )}
        <div>
          <p className="text-xs font-bold text-[#18181B]">{businessName}</p>
          <p className="text-[10px] text-zinc-400">Just now</p>
        </div>
      </div>
      {current === 'facebook' && headline.trim() && (
        <p className="px-3 pb-1 text-xs text-zinc-700">{headline.trim()}</p>
      )}
      {current !== 'instagram' && caption.trim() && (
        <div className="px-3 pb-2">
          <p className="line-clamp-4 whitespace-pre-line text-xs text-zinc-700">{caption}</p>
        </div>
      )}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Post preview" className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center bg-[#FAFAFA] text-zinc-400">
          <ImageIcon className="mb-2 h-8 w-8" />
          <p className="text-xs">Your image shows here</p>
        </div>
      )}
      {current === 'instagram' && caption.trim() && (
        <div className="px-3 py-2">
          <p className="line-clamp-4 whitespace-pre-line text-xs text-zinc-700">
            <span className="font-bold">{businessName}</span> {caption}
          </p>
        </div>
      )}
    </div>
  )
}
