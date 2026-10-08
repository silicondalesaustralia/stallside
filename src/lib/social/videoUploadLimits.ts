export const SOCIAL_VIDEO_MAX_BYTES = 250 * 1024 * 1024 // 250 MB
export const SOCIAL_VIDEO_MAX_DURATION_SECONDS = 60

export const SOCIAL_VIDEO_ALLOWED_MIMES = [
  'video/mp4',
  'video/quicktime',
] as const

export type SocialVideoMime = (typeof SOCIAL_VIDEO_ALLOWED_MIMES)[number]

export const SOCIAL_VIDEO_MIME_EXTENSIONS: Record<SocialVideoMime, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
}

export const SOCIAL_VIDEO_BUCKET = 'social-posts'

export const SOCIAL_VIDEO_ERRORS = {
  tooLarge: 'This video is too large. Upload a video under 250 MB.',
  tooLong: 'Videos can currently be up to 60 seconds.',
  unsupported: 'Upload an MP4 or MOV video.',
  uploadFailed: "We couldn't upload this video. Please try again.",
  finalizeFailed: "We couldn't prepare this video for your Library.",
} as const

export function isAllowedSocialVideoMime(mime: string): mime is SocialVideoMime {
  return (SOCIAL_VIDEO_ALLOWED_MIMES as readonly string[]).includes(mime)
}

export function extensionForSocialVideoMime(mime: SocialVideoMime): string {
  return SOCIAL_VIDEO_MIME_EXTENSIONS[mime]
}
