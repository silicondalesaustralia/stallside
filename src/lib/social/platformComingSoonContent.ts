export type SocialComingSoonPlatform = 'google_business' | 'facebook' | 'instagram'

export interface SocialComingSoonPlatformContent {
  platformLabel: string
  approvalProvider: 'Google' | 'Meta'
  /** Short reassurance copy for the approval gate */
  approvalBlurb: string
  manualSteps: string[]
  externalUrl?: { label: string; href: string }
}

export const SOCIAL_LIBRARY_PATH = '/dashboard/social?tab=library'

export const PLATFORM_COMING_SOON: Record<SocialComingSoonPlatform, SocialComingSoonPlatformContent> = {
  google_business: {
    platformLabel: 'Google Business Profile',
    approvalProvider: 'Google',
    approvalBlurb:
      'One-click posting to Google Business Profile is in final approval with Google - a standard review process third-party apps go through before they can post on your behalf. We\'ll notify you the moment it\'s ready.',
    manualSteps: [
      'Open Google Business Profile Manager at business.google.com and sign in with the account that manages your listing.',
      'Select your business, then open Updates (or Posts) in the left menu.',
      'Choose Add update (or Create post), upload the image you saved from StitchedUp, and paste your caption.',
      'Publish the post - it will appear on your Google Search and Maps listing.',
    ],
    externalUrl: {
      label: 'Open Google Business Profile Manager',
      href: 'https://business.google.com/',
    },
  },
  facebook: {
    platformLabel: 'Facebook',
    approvalProvider: 'Meta',
    approvalBlurb:
      'One-click posting to Facebook is in final approval with Meta - a standard review process third-party apps go through before they\'re allowed to post on your behalf. We\'ll notify you the moment it\'s ready.',
    manualSteps: [
      'In StitchedUp, download your post image and copy the caption (or grab both from Social → Library).',
      'Open the Facebook app or Meta Business Suite (business.facebook.com) and go to your business Page.',
      'Create a new post, upload the saved image, paste the caption, and publish.',
    ],
    externalUrl: {
      label: 'Open Meta Business Suite',
      href: 'https://business.facebook.com/',
    },
  },
  instagram: {
    platformLabel: 'Instagram',
    approvalProvider: 'Meta',
    approvalBlurb:
      'One-click posting to Instagram is in final approval with Meta - a standard review process third-party apps go through before they\'re allowed to post on your behalf. We\'ll notify you the moment it\'s ready.',
    manualSteps: [
      'In StitchedUp, download your post image and copy the caption (or grab both from Social → Library).',
      'Open the Instagram app on your phone (feed posts are easiest from mobile) or use Meta Business Suite on desktop if your account is linked to your Facebook Page.',
      'Create a new post, select the saved image, paste the caption, and share.',
    ],
    externalUrl: {
      label: 'Open Meta Business Suite',
      href: 'https://business.facebook.com/',
    },
  },
}
