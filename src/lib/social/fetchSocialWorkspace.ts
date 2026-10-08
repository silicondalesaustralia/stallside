import type {
  SocialWorkspaceBusiness,
  SocialWorkspacePost,
} from '@/lib/social/useSocialWorkspace'

export type SocialWorkspaceFeatures = {
  infographicAiBackground: boolean
  aiDesignedEnabled: boolean
}

export type SocialWorkspaceFetchResult = {
  business: SocialWorkspaceBusiness | null
  posts: SocialWorkspacePost[]
  features: SocialWorkspaceFeatures
  error: string | null
  unauthorized: boolean
}

/** Shared fetch logic for social workspace (used by hook + TradiesPost provider). */
export async function fetchSocialWorkspaceData(): Promise<SocialWorkspaceFetchResult> {
  try {
    const res = await fetch('/api/social/context')
    if (res.status === 401) {
      return {
        business: null,
        posts: [],
        features: { infographicAiBackground: false, aiDesignedEnabled: false },
        error: null,
        unauthorized: true,
      }
    }
    if (!res.ok) {
      let body: Record<string, unknown> = {}
      try {
        body = await res.json()
      } catch {
        /* not JSON */
      }
      const detail =
        (body.detail as string) || (body.error as string) || `HTTP ${res.status}`
      return {
        business: null,
        posts: [],
        features: { infographicAiBackground: false, aiDesignedEnabled: false },
        error: detail,
        unauthorized: false,
      }
    }
    const { business: bizData, posts: postData, features } = await res.json()
    return {
      business: bizData ? (bizData as SocialWorkspaceBusiness) : null,
      posts: (postData as SocialWorkspacePost[]) || [],
      features: {
        infographicAiBackground: Boolean(features?.infographicAiBackground),
        aiDesignedEnabled: Boolean(features?.aiDesignedEnabled),
      },
      error: bizData ? null : 'API returned no business data',
      unauthorized: false,
    }
  } catch (err) {
    return {
      business: null,
      posts: [],
      features: { infographicAiBackground: false, aiDesignedEnabled: false },
      error: err instanceof Error ? err.message : 'Unknown error',
      unauthorized: false,
    }
  }
}
