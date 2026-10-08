export type SocialHelpTopic = {
  title: string
  body: string
  learnMore?: string
}

export const SOCIAL_HELP = {
  aiDesigned: {
    title: 'AI Designed',
    body: 'Tell us what you want to promote and we’ll create three complete social post designs for you. You don’t need to choose fonts, layouts or text positions.',
  },
  buildLayout: {
    title: 'Build a layout',
    body: 'Choose the image, wording and layout yourself. Use this when you want more control over exactly how the post looks.',
  },
  postType: {
    title: 'What kind of post?',
    body: 'This helps us understand the purpose of your post. If you’re not sure, you can skip it and simply describe what you want below.',
  },
  trustProofChip: {
    title: 'Trust / proof',
    body: 'Posts that build confidence in your business - for example completed work, experience, workmanship or customer proof. Only use real details you already have.',
  },
  brief: {
    title: 'What should this post be about?',
    body: 'Describe the post in your own words. Tell us the service, completed job, offer, customer problem or message you want to focus on. The more useful detail you give us, the better we can tailor the designs.',
    learnMore:
      'For example: “We replaced an old gas heater with a new ducted electric system in Brighton. Focus on better comfort and energy efficiency.”',
  },
  createThreeVersions: {
    title: 'Create 3 versions',
    body: 'One render creates up to three different designs for you to choose from. You’re charged for the generation - not for choosing, saving, changing the logo or downloading the design.',
  },
  messageAngles: {
    title: 'Your versions',
    body: 'All three versions are about the same post. We change the messaging and design style so you have different approaches to choose from.',
  },
  boldDirect: {
    title: 'Bold & direct',
    body: 'Puts the main benefit front and centre with a stronger call to action.',
  },
  helpfulEducational: {
    title: 'Helpful & educational',
    body: 'Explains something useful to the customer while still promoting your business.',
  },
  trustProofAngle: {
    title: 'Trust & proof',
    body: 'Focuses on workmanship, professionalism and reasons customers can feel confident choosing you.',
  },
  recreate: {
    title: 'Recreate',
    body: 'Upload a social post or ad you like. StitchedUp analyses it and builds three layout-style previews you can Tune. Previews do not use a render, and we won’t simply swap the logo or copy the original.',
  },
  closest: {
    title: 'Closest',
    body: 'Keep more of the original post’s overall layout, energy and visual structure, but rebuild the content for your business.',
  },
  freshTake: {
    title: 'Fresh take',
    body: 'Keep the overall style and energy you liked, but give us more freedom to create a different layout and composition.',
  },
  creativeDirection: {
    title: 'Creative direction',
    body: 'This is what we’ve picked up from your inspiration image - things like whether it is bold, photo-led, high contrast or promotional. We use it as a creative brief, not a template to copy.',
  },
  recreateGuidance: {
    title: 'What should we change or focus on?',
    body: 'Tell us anything you want changed from the inspiration. For example, change the service, remove an offer, use a different type of person or make the design feel more premium.',
  },
  logo: {
    title: 'Logo',
    body: 'Choose which approved version of your logo to use on this post. Changing it here will not change your business’s Primary logo.',
    learnMore:
      'Your Primary logo is the version StitchedUp uses by default. You can choose another logo for an individual post without changing it.',
  },
  logoPlacement: {
    title: 'Logo position and size',
    body: 'Choose where your logo appears and how large it is. This does not regenerate the image or use another render.',
  },
  creativeFormat: {
    title: 'Creative format',
    body: 'Scene-style uses a photo as the main visual with your headline on top. Infographic is best for steps or key points. A quote card is built around one main quote or statement.',
  },
  library: {
    title: 'Library',
    body: 'Your saved social posts live here. Add or edit captions, download designs, publish now or schedule them for later.',
    learnMore:
      'The size on each card is the image format the design was created in. You can still download or publish that same design.',
  },
  caption: {
    title: 'Caption',
    body: 'A caption is the written text that appears with your image when you post it on Facebook, Instagram or Google Business.',
  },
  regenerateCaption: {
    title: 'Regenerate',
    body: 'Creates another version of the caption. Your image will not change.',
  },
  download: {
    title: 'Download',
    body: 'Download the image and copy the caption if you prefer to upload the post yourself.',
  },
  publishTo: {
    title: 'Publish to',
    body: 'Choose where you want StitchedUp to publish this post. You’ll need to connect each social account before it can be selected.',
    learnMore:
      'Facebook publishes to your connected Facebook Business Page. Instagram publishes to your connected Instagram Business account. Google Business publishes updates to your Google Business Profile.',
  },
  postNow: {
    title: 'Post now',
    body: 'Publishes this image and caption to the selected connected accounts now.',
  },
  schedule: {
    title: 'Schedule',
    body: 'Choose when you want the post published. Scheduled posts are processed automatically around the selected time.',
  },
  connectSocials: {
    title: 'Connect socials',
    body: 'Connecting an account lets StitchedUp publish and schedule posts for you. You can still download your image and copy the caption if you prefer to post manually.',
  },
  facebook: {
    title: 'Facebook',
    body: 'Publish posts to your connected Facebook Business Page.',
  },
  instagram: {
    title: 'Instagram',
    body: 'Publish to your connected Instagram Business account.',
  },
  googleBusiness: {
    title: 'Google Business',
    body: 'Publish updates to your Google Business Profile.',
  },
  scheduled: {
    title: 'Scheduled',
    body: 'Posts waiting to be published automatically. You can review or cancel scheduled posts here.',
  },
  published: {
    title: 'Published',
    body: 'Posts that have already been published through StitchedUp, plus posts you’ve marked as published manually.',
  },
  postDefaults: {
    title: 'Post defaults',
    body: 'These are your usual settings when creating social posts. Changing them affects future posts, not posts you’ve already created.',
  },
  brandVoice: {
    title: 'Brand voice',
    body: 'How you want your business to sound - for example friendly, professional, straight-talking or premium.',
  },
  defaultCta: {
    title: 'Default call to action',
    body: 'The action you usually want customers to take, such as Get a Quote or Book Now.',
  },
  autoPrompt: {
    title: 'Auto-prompt after job paid',
    body: 'When you mark a job as paid, StitchedUp can ask if you want to create a social post about it.',
  },
  renderBalance: {
    title: 'Renders',
    body: 'Renders are used when StitchedUp creates new AI images. AI Designed uses one render for up to three designs. Current Recreate previews do not use a render.',
    learnMore: 'Captions, logo adjustments, downloads and publishing do not use renders.',
  },
} as const satisfies Record<string, SocialHelpTopic>

export type SocialHelpTopicId = keyof typeof SOCIAL_HELP

export function getSocialHelp(id: SocialHelpTopicId): SocialHelpTopic {
  return SOCIAL_HELP[id]
}

export const MESSAGE_ANGLE_HELP: Record<
  'bold_direct' | 'helpful_educational' | 'trust_proof',
  SocialHelpTopicId
> = {
  bold_direct: 'boldDirect',
  helpful_educational: 'helpfulEducational',
  trust_proof: 'trustProofAngle',
}
