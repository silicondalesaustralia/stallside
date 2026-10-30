/**
 * HOST INTEGRATION POINT #2 - URLs and paths for the host app.
 * All values can be overridden by env so no code edit is needed per environment.
 */

/** Canonical public origin of the host app (no trailing slash). Used for OAuth redirect URIs
 *  and media URLs TikTok/Meta fetch - must be the exact origin registered in those apps. */
export function hostPublicOrigin(): string {
  const raw =
    process.env.SOCIAL_PUBLIC_ORIGIN?.trim() ||
    vercelPreviewBranchOrigin() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://www.vendl.app'
  return raw.replace(/\/$/, '')
}

/** Preview deploys must round-trip OAuth to their stable branch URL, not production. */
function vercelPreviewBranchOrigin(): string | null {
  const branchHost = process.env.VERCEL_BRANCH_URL?.trim()
  return process.env.VERCEL_ENV === 'preview' && branchHost ? `https://${branchHost}` : null
}

/** Where the social pages are mounted. The kit's links are pre-rewritten to /social/*. */
export const SOCIAL_BASE_PATH = '/dashboard/social'

export const SOCIAL_PATHS = {
  create: `${SOCIAL_BASE_PATH}/create`,
  library: `${SOCIAL_BASE_PATH}/library`,
  videos: `${SOCIAL_BASE_PATH}/videos`,
  planner: `${SOCIAL_BASE_PATH}/planner`,
  posts: `${SOCIAL_BASE_PATH}/posts`,
  calendar: `${SOCIAL_BASE_PATH}/calendar`,
  connections: `${SOCIAL_BASE_PATH}/connections`,
  brand: `${SOCIAL_BASE_PATH}/brand`,
} as const

/** Sidebar page listing every connector (same view as Social → Connections). */
export const CONNECTORS_PATH = '/dashboard/connectors'

/** OAuth callbacks may only bounce back to these host paths (open-redirect guard). */
export const OAUTH_RETURN_PATHS = [
  SOCIAL_PATHS.connections,
  SOCIAL_PATHS.create,
  SOCIAL_PATHS.library,
  CONNECTORS_PATH,
]

/** gpt-image quality for AI renders: 'high' (TradiesPost) or 'medium' (cheaper). */
export function hostImageQuality(): 'medium' | 'high' {
  return process.env.SOCIAL_IMAGE_QUALITY === 'medium' ? 'medium' : 'high'
}
