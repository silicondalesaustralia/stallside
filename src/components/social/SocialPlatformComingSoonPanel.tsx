'use client'

import Link from 'next/link'
import { Clock, ExternalLink, ImageIcon } from 'lucide-react'
import {
  PLATFORM_COMING_SOON,
  SOCIAL_LIBRARY_PATH,
  type SocialComingSoonPlatform,
} from '@/lib/social/platformComingSoonContent'

interface SocialPlatformComingSoonPanelProps {
  platform: SocialComingSoonPlatform
  /** settings = full panel on Integrations; compact = shorter block inside compose flow */
  variant?: 'settings' | 'compact'
  /** When false, show manual-post steps only (compose flow for disconnected but live connect) */
  showApprovalNote?: boolean
  className?: string
}

export function SocialPlatformComingSoonPanel({
  platform,
  variant = 'settings',
  showApprovalNote = true,
  className = '',
}: SocialPlatformComingSoonPanelProps) {
  const content = PLATFORM_COMING_SOON[platform]
  const isCompact = variant === 'compact'

  return (
    <div
      className={
        isCompact
          ? `rounded-xl border border-[#EDEAE2] bg-[#FAFAF7] p-3 ${className}`
          : className
      }
    >
      {showApprovalNote && (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              <Clock className="h-3 w-3" />
              Coming soon
            </span>
            {!isCompact && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#888]">
                {content.approvalProvider} review in progress
              </span>
            )}
          </div>

          <p className={`text-[#555] ${isCompact ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed'}`}>
            {content.approvalBlurb}
          </p>
        </>
      )}

      {!showApprovalNote && (
        <p className={`font-semibold text-[#111] ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {content.platformLabel}
        </p>
      )}

      {isCompact ? (
        <div className={showApprovalNote ? 'mt-3' : 'mt-2'}>
          {showApprovalNote && (
            <p className="text-xs font-semibold text-[#111]">
              Post manually in the meantime
            </p>
          )}
          {!showApprovalNote && (
            <p className="text-[11px] text-[#666]">
              Post manually for now:
            </p>
          )}
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-[#666]">
            {content.manualSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : (
        <details className={showApprovalNote ? 'mt-3' : 'mt-2'}>
          <summary className="cursor-pointer text-xs font-semibold text-[#555] hover:text-[#111]">
            {showApprovalNote ? 'Post manually in the meantime' : 'Post manually for now'}
          </summary>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#666]">
            {content.manualSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </details>
      )}

      <div className={`flex flex-wrap gap-2 ${isCompact ? 'mt-3' : 'mt-4'}`}>
        <Link
          href={SOCIAL_LIBRARY_PATH}
          className={`inline-flex items-center gap-1.5 rounded-lg bg-[#FFD700] px-3 py-2 font-bold text-black transition-colors hover:bg-yellow-400 ${
            isCompact ? 'text-[11px]' : 'text-xs'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Open Social Library
        </Link>
        {content.externalUrl && (
          <a
            href={content.externalUrl.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 font-semibold text-[#444] transition-colors hover:bg-[#FAFAF7] ${
              isCompact ? 'text-[11px]' : 'text-xs'
            }`}
          >
            {content.externalUrl.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}
