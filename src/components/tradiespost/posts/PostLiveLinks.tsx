import { ExternalLink } from 'lucide-react'
import type { SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'
import { SOCIAL_PUBLISH_PLATFORM_LABELS } from '@/lib/social/libraryPublish'
import { isDemoPostId, openPostHref } from '@/lib/social/postLinks'
import type { platformOutcomes } from '@/lib/tradiespost/posts/derivePostOutcome'

type Props = {
  post: SocialWorkspacePost
  outcomes: ReturnType<typeof platformOutcomes>
  className: string
}

/** "View on …" for every platform this post went live on (opens in a new tab). */
export function PostLiveLinks({ post, outcomes, className }: Props) {
  const live = outcomes.filter(({ platform, outcome }) => {
    const postId = post[`${platform}_post_id`]
    return outcome === 'success' && typeof postId === 'string' && postId && !isDemoPostId(postId)
  })
  return (
    <>
      {live.map(({ platform }) => (
        <a
          key={platform}
          href={openPostHref(post.id, platform)}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          data-testid={`post-open-${platform}`}
        >
          <ExternalLink className="h-3 w-3" /> View on {SOCIAL_PUBLISH_PLATFORM_LABELS[platform]}
        </a>
      ))}
    </>
  )
}
