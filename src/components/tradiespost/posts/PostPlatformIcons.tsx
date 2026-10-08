import { SOCIAL_PUBLISH_PLATFORM_LABELS } from '@/lib/social/libraryPublish'
import type { platformOutcomes, PlatformOutcome } from '@/lib/tradiespost/posts/derivePostOutcome'

const SHORT: Record<string, string> = { facebook: 'FB', instagram: 'IG', gmb: 'Google', tiktok: 'TikTok' }

const TONE: Record<PlatformOutcome, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-zinc-200 bg-zinc-50 text-zinc-500',
}

type Props = { outcomes: ReturnType<typeof platformOutcomes> }

export function PostPlatformIcons({ outcomes }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {outcomes.map(({ platform, outcome }) => (
        <span
          key={platform}
          title={`${SOCIAL_PUBLISH_PLATFORM_LABELS[platform]}: ${outcome}`}
          className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${TONE[outcome]}`}
        >
          {SHORT[platform]}
        </span>
      ))}
    </div>
  )
}
