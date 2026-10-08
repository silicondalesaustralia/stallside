'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SocialPlatformComingSoonPanel } from '@/components/social/SocialPlatformComingSoonPanel'
import type { SocialComingSoonPlatform } from '@/lib/social/platformComingSoonContent'

interface SocialManualPostGuideProps {
  platforms: SocialComingSoonPlatform[]
  /** Per-platform: show approval "coming soon" note (connect not live yet) */
  showApprovalNote?: Partial<Record<SocialComingSoonPlatform, boolean>>
}

const PLATFORM_ORDER: SocialComingSoonPlatform[] = [
  'google_business',
  'instagram',
  'facebook',
]

export function SocialManualPostGuide({
  platforms,
  showApprovalNote = {},
}: SocialManualPostGuideProps) {
  const [open, setOpen] = useState(false)

  const ordered = PLATFORM_ORDER.filter((p) => platforms.includes(p))
  if (ordered.length === 0) return null

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-xs font-bold text-blue-900">
          How to post this to {ordered.length === 1 ? PLATFORM_COMING_SOON_LABEL[ordered[0]] : 'Google, Instagram, or Facebook'}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-blue-700" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-blue-700" />
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {ordered.map((platform) => (
            <SocialPlatformComingSoonPanel
              key={platform}
              platform={platform}
              variant="compact"
              showApprovalNote={showApprovalNote[platform] ?? true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const PLATFORM_COMING_SOON_LABEL: Record<SocialComingSoonPlatform, string> = {
  google_business: 'Google Business Profile',
  facebook: 'Facebook',
  instagram: 'Instagram',
}
