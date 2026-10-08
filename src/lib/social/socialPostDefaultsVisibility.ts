export type SocialTopTab = 'create' | 'planner' | 'library' | 'calendar' | 'published' | 'help'

export const SOCIAL_TOP_TAB_IDS: SocialTopTab[] = [
  'create',
  'planner',
  'library',
  'calendar',
  'published',
  'help',
]

export function isSocialTopTab(value: string): value is SocialTopTab {
  return (SOCIAL_TOP_TAB_IDS as readonly string[]).includes(value)
}

/** Help is always shown in Social navigation. */
export function isSocialHelpTabAlwaysVisible(): boolean {
  return SOCIAL_TOP_TAB_IDS.includes('help')
}

/** Post defaults accordion is Create-only. Hidden on Library / Scheduled / Published / Help. */
export function shouldShowSocialPostDefaultsPanel(tab: SocialTopTab): boolean {
  return tab === 'create'
}
