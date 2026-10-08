import { socialHelpArticleHref } from '@/components/marketing/help/helpSocialContent'
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

/** Contextual InfoGuide → canonical /help Social articles. */
export const SOCIAL_HELP_TOPIC_ARTICLES: Partial<Record<SocialHelpTopicId, string>> = {
  aiDesigned: 'social-ai-designed',
  buildLayout: 'social-build-layout',
  brief: 'social-brief',
  createThreeVersions: 'social-renders',
  recreate: 'social-recreate',
  closest: 'social-recreate',
  freshTake: 'social-recreate',
  creativeDirection: 'social-recreate',
  recreateGuidance: 'social-recreate',
  logo: 'social-logo-variants',
  logoPlacement: 'social-change-logo',
  library: 'social-save-download',
  caption: 'social-captions',
  regenerateCaption: 'social-captions',
  download: 'social-save-download',
  publishTo: 'social-platforms',
  postNow: 'social-publishing',
  schedule: 'social-scheduling',
  connectSocials: 'social-platforms',
  scheduled: 'social-scheduling',
  published: 'social-publishing',
  renderBalance: 'social-renders',
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
  return articleId ? socialHelpArticleHref(articleId) : null
}
