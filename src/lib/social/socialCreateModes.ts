export type SocialCreationMode = 'images' | 'video'

export const SOCIAL_CREATION_MODES = [
  { id: 'images' as const, label: 'Create Images' },
  { id: 'video' as const, label: 'Create Video' },
]

export const DEFAULT_SOCIAL_CREATION_MODE: SocialCreationMode = 'images'

export const CREATE_VIDEO_BULLETS = [
  'Upload MP4 or MOV',
  'Up to 60 seconds',
  'Add job context',
  'Generate a caption',
  'Save to your Library',
] as const
