import type { SocialHelpTopicId } from '@/lib/social/socialHelpContent'

export const SOCIAL_HELP_PAGE_ANCHORS = [
  'start',
  'create',
  'ai-designed',
  'brief',
  'recreate',
  'build-layout',
  'branding',
  'captions',
  'library',
  'connections',
  'publishing',
  'scheduling',
  'renders',
  'faq',
] as const

export type SocialHelpPageAnchor = (typeof SOCIAL_HELP_PAGE_ANCHORS)[number]

export function socialHelpPageHref(anchor: SocialHelpPageAnchor): string {
  return `/dashboard/social?tab=help#${anchor}`
}

/** Contextual InfoGuide → owner guide slugs under /dashboard/knowledge. */
export const SOCIAL_HELP_TOPIC_ARTICLES: Partial<Record<SocialHelpTopicId, string>> = {
  aiDesigned: 'social-ai-images',
  buildLayout: 'social-ai-images',
  brief: 'social-ai-images',
  createThreeVersions: 'social-ai-images',
  recreate: 'social-ai-images',
  closest: 'social-ai-images',
  freshTake: 'social-ai-images',
  creativeDirection: 'social-ai-images',
  recreateGuidance: 'social-ai-images',
  logo: 'social-brand',
  logoPlacement: 'social-brand',
  library: 'social-library',
  caption: 'social-create-post',
  regenerateCaption: 'social-create-post',
  download: 'social-library',
  publishTo: 'social-connections',
  postNow: 'social-create-post',
  schedule: 'social-posts-calendar',
  connectSocials: 'social-connections',
  scheduled: 'social-posts-calendar',
  published: 'social-posts-calendar',
  renderBalance: 'social-ai-images',
}

/** Kept so existing hash helpers still compile; InfoGuides use /help. */
export const SOCIAL_HELP_TOPIC_ANCHORS: Partial<Record<SocialHelpTopicId, SocialHelpPageAnchor>> = {
  aiDesigned: 'ai-designed',
  buildLayout: 'build-layout',
  brief: 'brief',
  createThreeVersions: 'renders',
  recreate: 'recreate',
  closest: 'recreate',
  freshTake: 'recreate',
  creativeDirection: 'recreate',
  recreateGuidance: 'recreate',
  logo: 'branding',
  logoPlacement: 'branding',
  library: 'library',
  caption: 'captions',
  regenerateCaption: 'captions',
  download: 'connections',
  publishTo: 'publishing',
  postNow: 'publishing',
  schedule: 'scheduling',
  connectSocials: 'connections',
  scheduled: 'scheduling',
  published: 'publishing',
  renderBalance: 'renders',
}

export function socialHelpTopicHref(topic: SocialHelpTopicId): string | null {
  const articleId = SOCIAL_HELP_TOPIC_ARTICLES[topic]
  return articleId ? `/dashboard/knowledge/${articleId}` : null
}
