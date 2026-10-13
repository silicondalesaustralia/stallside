import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'

/** Ids from SOCIAL_DEMO_MODE publishes never exist on the platform. */
export function isDemoPostId(postId: string): boolean {
  return postId.startsWith('demo-')
}

/** Public URL built from the stored id alone; null for platforms that need an API lookup (Instagram, Google). */
export function directPostUrl(platform: SocialPublishPlatform, postId: string): string | null {
  const id = encodeURIComponent(postId)
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/${id}`
    case 'youtube':
      return `https://www.youtube.com/watch?v=${id}`
    case 'pinterest':
      return `https://www.pinterest.com/pin/${id}/`
    case 'tiktok':
      // Public post ids are numeric; anything else is the publish id (no public page yet).
      return /^\d+$/.test(postId) ? `https://www.tiktok.com/@/video/${id}` : null
    default:
      return null
  }
}

/** Dashboard route that resolves and redirects to the live post. */
export function openPostHref(postId: string, platform: SocialPublishPlatform): string {
  return `/api/social/posts/${postId}/open/${platform}`
}
