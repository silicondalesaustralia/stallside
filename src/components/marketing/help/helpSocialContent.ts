import { Megaphone } from 'lucide-react'
import type { HelpFaqCategory, HelpFaqQuestion } from '@/components/marketing/help/helpContent'

export const SOCIAL_HELP_CATEGORY_ID = 'social-media'

export function socialHelpArticleHref(questionId: string): string {
  return `/help?article=${SOCIAL_HELP_CATEGORY_ID}-${questionId}`
}

const SOCIAL_P0_QUESTIONS: readonly HelpFaqQuestion[] = [
  {
    id: 'social-overview',
    q: 'What is StitchedUp Social?',
    keywords: ['social', 'overview', 'library', 'planner', 'build my week', 'video'],
    a: 'Social is where you make branded posts for your trade business - then save, download, publish, or schedule them.\n\nOpen Social from the sidebar. You can create images or a short video, plan a week of posts, and keep finished work in Library.\n\nWays to create an image:\n- AI Designed - describe what you want and get complete designs to choose from.\n- Build a layout - place your own wording and photo (including job photos) yourself.\n- Recreate - upload a post you like and use it as inspiration.\n\nYou can also upload a short video, add branding, and write a caption. Planner (Build My Week) helps you line up several posts at once. Nothing goes live until you publish, schedule, or download and post it yourself.\n\nThere is no Compose tab. Start from Create.',
  },
  {
    id: 'social-first-post',
    q: 'How do I create my first post?',
    keywords: ['first post', 'getting started', 'create', 'ai designed', 'recreate', 'video'],
    a: 'Go to Social → Create.\n\nFor images, pick Start from scratch or Recreate.\n\nStart from scratch:\n- AI Designed is available now and is the usual first choice. Write what the post is about, optionally attach a recent job for suburb and job-type context, pick a logo, then create designs.\n- Build a layout if you already have a photo and want to set the wording and layout yourself.\n\nRecreate if you have an example post or ad to upload as inspiration.\n\nFor video, switch to Create Video, upload an MP4 or MOV (up to 60 seconds), add a logo or headline if you want, generate a caption, and save to Library.\n\nAfter you like a result, save it. Then download it, publish to a connected account, or schedule it. Saving does not publish.',
  },
  {
    id: 'social-ai-designed',
    q: 'What is AI Designed?',
    keywords: ['ai designed', 'three versions', 'scratch', 'brief'],
    a: 'AI Designed is the Start from scratch option that builds complete post designs from your brief. You do not pick fonts or text positions.\n\nYou can choose a post focus (for example completed job or promotion), write what the post should be about, optionally pick a recent job for context, and choose a logo.\n\nOne render creates up to three different designs of the same post. Pick the one you like. Saving it, changing the logo, or downloading it does not use another render.\n\nA recent job adds the job type, suburb, and description to the brief. It does not stamp the job photo onto the design - use Build a layout if you want the real photo on the post.',
  },
  {
    id: 'social-recreate',
    q: 'What is Recreate from inspiration?',
    keywords: ['recreate', 'inspiration', 'preview', 'tune'],
    a: 'Recreate lets you upload a social post or ad you like. StitchedUp looks at the overall style and direction, then builds three layout-style previews for your business.\n\nThose previews do not use a render. You can Tune the wording, photo, and layout, then pick a direction and save it to Library.\n\nRecreate is inspiration, not a copy machine. It will not simply swap your logo onto someone else’s post.\n\nClosest and Fresh take are not part of the current Recreate flow. If you see those names elsewhere, they are not how Recreate works today.',
  },
  {
    id: 'social-recreate-originality',
    q: 'Why doesn’t Recreate copy the original exactly?',
    keywords: ['original', 'copyright', 'inspiration', 'placeholder'],
    a: 'That is intentional. The upload is a creative direction - energy, layout ideas, and style - not a template to duplicate.\n\nStitchedUp should rebuild the idea for your business with new wording and imagery. It should not copy another company’s name, logo, offer, phone number, or distinctive branding.\n\nIt also should not draw fake “LOGO” boxes or invented badges. Use your real saved logo, or choose No logo.\n\nIf a preview feels too close to the original, Tune it or start again with clearer notes about what to change (service, suburb, offer, or look).',
  },
  {
    id: 'social-captions',
    q: 'How do captions work?',
    keywords: ['caption', 'regenerate', 'facebook', 'instagram'],
    a: 'A caption is the written text that goes with the image or video on Facebook, Instagram, or Google Business.\n\nFrom Library (or while you finish a post) you can generate a caption, edit it, or regenerate a new version. Regenerating only changes the words - the image stays the same.\n\nCaptions are free. They do not use a render. Video captions are also free.',
  },
  {
    id: 'social-logo-variants',
    q: 'Which logo should I use?',
    keywords: ['logo', 'primary', 'white', 'dark', 'icon', 'horizontal', 'stacked'],
    a: 'Save approved logos under Settings → Brand. You can store:\n- Primary - the default StitchedUp uses unless you pick another\n- White - for dark backgrounds\n- Dark - for light backgrounds\n- Icon - mark only\n- Horizontal - wide lockup\n- Stacked - stacked lockup\n- Other - any extra approved file\n\nChoosing a logo on one post does not change your Primary logo for the rest of the business.',
  },
  {
    id: 'social-no-logo',
    q: 'Can I create a post without a logo?',
    keywords: ['no logo', 'remove logo'],
    a: 'Yes. Choose No logo on that post. The design is saved without a mark on it.\n\nThat does not delete the logos stored in Brand settings. Other posts still use your Primary logo unless you change them too.',
  },
  {
    id: 'social-change-logo',
    q: 'Can I change the logo after generating?',
    keywords: ['change logo', 'move', 'resize', 'position'],
    a: 'Yes. After a design exists you can switch to another saved logo, move it, resize it, or choose No logo.\n\nThose changes do not regenerate the artwork and do not use a render.',
  },
  {
    id: 'social-renders',
    q: 'How do renders work?',
    keywords: ['renders', 'credits', 'included', 'monthly', 'extra render'],
    a: 'A render is used when StitchedUp creates new AI artwork. Your plan includes 10 renders each calendar month (Australia/Sydney dates). Unused included renders do not stack forever - the count resets at the start of the next Sydney month.\n\nAI Designed uses 1 render and can return up to three designs. After your 10 included renders are used, each extra render is $1 AUD from purchased usage on Billing.\n\nBuy render packs on Billing when you need more. There is no one-off free trial render on this usage model.\n\nSee also: What does not use a render? and What render packs can I buy?',
  },
  {
    id: 'social-no-render',
    q: 'What does not use a render?',
    keywords: ['free', 'no render', 'captions', 'logo', 'download', 'publish'],
    a: 'These do not use a render:\n- generating or regenerating a caption (including video captions)\n- changing, moving, resizing, or removing a logo\n- saving to Library\n- downloading\n- publishing or scheduling\n- Build a layout when you use an existing job, stock, library, or uploaded photo\n- Recreate preview layouts (the current inspiration previews)\n\nA render is used for AI Designed (one render for up to three designs) and for an AI-generated photo in Build a layout.',
  },
  {
    id: 'social-render-packs',
    q: 'What render packs can I buy?',
    keywords: ['render packs', 'buy', '5', '10', '20', 'expire'],
    a: 'On Billing you can buy extra renders when your included monthly allowance is used:\n- 10 renders - $5 AUD\n- 25 renders - $10 AUD\n- 60 renders - $20 AUD\n\nPurchased packs do not expire. They add extra usage after the 10 included renders for the month. Each extra render after the included allowance is $1 AUD.',
  },
  {
    id: 'social-render-failure',
    q: 'What happens if a render fails?',
    keywords: ['failed render', 'refund', 'retry', 'partial'],
    a: 'For AI Designed, StitchedUp uses the render when it starts creating the three versions.\n\nIf every version fails, that render is returned to you. If at least one usable design comes back, the render stays used - you still have something to pick.\n\nCurrent Recreate previews do not use a render, so a failed preview has no render to refund. Try again, or use a clearer inspiration image.\n\nIf you are out of included renders, check Billing before retrying a paid AI Designed run.',
  },
  {
    id: 'social-publishing',
    q: 'How do I publish or schedule a post?',
    keywords: ['publish', 'schedule', 'library', 'calendar', 'facebook', 'instagram', 'google'],
    a: 'Save the design to Library first. Saving does not publish.\n\nFrom Library you can:\n- download the image and copy the caption, then post it yourself\n- publish now to connected Facebook, Instagram, or Google Business accounts\n- schedule a date and time\n\nCalendar shows what is waiting to go out. Published shows posts that went live through StitchedUp, plus posts you marked as posted by hand. Failed publishes can be retried from Published.\n\nConnecting accounts is optional. You can always download and post manually. Direct publish and schedule need a connected account for that platform.',
  },
  {
    id: 'social-mistakes',
    q: 'What are common Social setup mistakes?',
    keywords: ['mistakes', 'compose', 'save', 'connect'],
    a: 'Common mix-ups:\n- Looking for an old Compose tab - use Create (AI Designed, Build a layout, or Recreate).\n- Expecting Recreate to rebuild the uploaded image pixel-for-pixel - today you get layout-style previews you can Tune, not a paid lookalike generator.\n- Thinking captions cost a render - they do not.\n- Thinking Save publishes the post - it only stores it in Library.\n- Trying to publish with no Facebook, Instagram, or Google account connected - download instead, or connect under Settings → Integrations.\n- Leaving the wrong logo selected, or expecting a logo change to use another render - logo changes are free.\n- Using a blurry or tiny source photo in Build a layout.\n- Expecting every AI Designed run to return exactly three successful versions - you may get fewer; a full failure refunds the render.',
  },
  {
    id: 'social-troubleshooting',
    q: 'How do I troubleshoot a failed render?',
    keywords: ['troubleshooting', 'failed render', 'retry', 'usage'],
    a: 'If AI Designed fails completely, wait a moment and try again. A run with zero usable versions should return the render. If one or two versions work, the render stays used - pick from what you have.\n\nCheck the brief is clear, the optional job is the right one, and you still have included or purchased renders on Billing.\n\nFor Recreate, a failed preview does not spend a render. Try a sharper inspiration image, or Build a layout with your own photo.\n\nUnsupported or broken files will not generate. Use a normal photo for Build a layout, and MP4 or MOV up to 60 seconds for video.\n\nStitchedUp does not refund a render when at least one AI Designed version succeeded.',
  },
]

const SOCIAL_P1_QUESTIONS: readonly HelpFaqQuestion[] = [
  {
    id: 'social-job-photos',
    q: 'How do I use my own job photos?',
    keywords: ['job photo', 'photos', 'completed job'],
    a: 'Use Build a layout and pick a completed or recent job so the real photos are available. You can also upload a photo or reuse one from Library.\n\nAI Designed can attach a job for suburb and description, but it does not place that job photo on the artwork. Recreate uses the inspiration image you upload, not the job gallery.\n\nWeek Ahead may also suggest posts from recently completed jobs. Those stay as suggestions until you approve them.',
  },
  {
    id: 'social-before-after',
    q: 'How do before-and-after posts work?',
    keywords: ['before after', 'before-and-after', 'transformation'],
    a: 'In Build a layout, choose a Show our work / Before & After style post and use the real job photos. That is the path for a true before-and-after on site.\n\nAI Designed can talk about a transformation in the brief, but it generates new artwork rather than pairing your two job photos.\n\nOnly use photos you actually took on the job.',
  },
  {
    id: 'social-build-layout',
    q: 'What is Build a layout?',
    keywords: ['build a layout', 'scene', 'infographic', 'quote card'],
    a: 'Build a layout is the hands-on Create option. You choose the format (Scene-style, Infographic, or Quote card), the photo, the words, and where things sit.\n\nUse it when you already know the photo and message. Using a job, stock, library, or uploaded photo does not use a render. Choosing an AI-generated photo uses 1 render.\n\nThis replaced the old Compose-first flow. Same idea - you are in control of the layout - but it lives under Create → Start from scratch → Build a layout.',
  },
  {
    id: 'social-brief',
    q: 'What should I put in the AI Designed brief?',
    keywords: ['brief', 'prompt', 'write'],
    a: 'Write in normal language. Include the service or job, what changed for the customer, suburb if it matters, any real offer, and anything to leave out.\n\nToo vague: “Make an air-conditioning post.”\n\nBetter: “Promote ducted heating and cooling upgrades for Melbourne homeowners. Focus on replacing older systems. Keep it premium and residential - no emergency call-out wording.”\n\nMore useful detail usually means a tighter design. You still do not need to write like a designer.',
  },
  {
    id: 'social-planner',
    q: 'How does Planner / Build My Week work?',
    keywords: ['planner', 'build my week', 'week'],
    a: 'Planner (Build My Week) helps you line up several posts for the week instead of making one at a time.\n\nOpen Social → Planner, or use Build My Week from Create. Review the suggested posts, generate or adjust designs, add captions, then save, publish, or schedule.\n\nThis is separate from Week Ahead on the main dashboard. Week Ahead can still suggest a social post from a completed job; Planner is the Social week-building workspace.',
  },
  {
    id: 'social-video',
    q: 'How do I create a video post?',
    keywords: ['video', 'mp4', 'mov'],
    a: 'In Social → Create, switch to Create Video. Upload an MP4 or MOV up to 60 seconds, add optional job notes, place your logo or a headline if you want, generate a caption, and save to Library.\n\nVideo captions are free. You can download the branded clip or publish/schedule it the same way as an image post once it is in Library.',
  },
  {
    id: 'social-save-download',
    q: 'How do I save, download, and reuse content?',
    keywords: ['save', 'download', 'library', 'reuse'],
    a: 'Save puts the creative in Library. It does not publish.\n\nFrom Library, download the image (or video), copy the caption, and reuse the file wherever you post. You can publish the same Library item more than once if you need to.\n\nThe size shown on the card is the format it was created in - often square. StitchedUp does not automatically rebuild a new size for each network.',
  },
  {
    id: 'social-platforms',
    q: 'How do Facebook, Instagram, and Google publishing work?',
    keywords: ['facebook', 'instagram', 'google', 'connect', 'gmb'],
    a: 'Connect accounts under Settings → Integrations. Facebook publishes to your Facebook Business Page. Instagram publishes to the connected Instagram Business account (via Facebook). Google Business publishes a post to your Google Business Profile.\n\nYou can select more than one connected platform and send the same saved image and caption. Connecting is optional - download and post by hand anytime.\n\nSome AI designs are square. That same square image may be used on Facebook or Google; it is not auto-cropped to a new size yet.',
  },
  {
    id: 'social-scheduling',
    q: 'How does scheduling work?',
    keywords: ['schedule', 'calendar', 'time'],
    a: 'In Library, choose Schedule, pick connected platforms, and set a future date and time. Calendar shows what is waiting.\n\nScheduled posts go out automatically around the time you picked - not always at the exact minute. You can cancel a scheduled post from Calendar or the scheduled list.\n\nScheduling does not use a render. You need a saved caption and a connected account for each platform you schedule to.',
  },
  {
    id: 'social-team',
    q: 'Can my VA or team use Social?',
    keywords: ['team', 'va', 'permissions'],
    a: 'Yes, if that person can open Social in StitchedUp. Owners, team members, and VAs with Social access can create, save, and publish according to the connected accounts on the business.\n\nAccountant-only logins do not include Social. If someone cannot see Social in the menu, they need a different team role - not a separate Social password.',
  },
  {
    id: 'social-brand-voice',
    q: 'How do brand voice and the default call to action work?',
    keywords: ['brand voice', 'cta', 'post defaults'],
    a: 'On Create, open Post defaults. Brand voice is how you want captions and copy to sound (for example straight-talking or premium). The default call to action is the usual next step, such as Get a quote or Call us.\n\nThese defaults apply to new posts. They do not rewrite posts you have already saved. You can still edit any caption before you publish.',
  },
  {
    id: 'social-month-workflow',
    q: 'How do I create a month of content efficiently?',
    keywords: ['month', 'batch', 'workflow'],
    a: 'A practical rhythm:\n1. Gather recent job photos and any offers you actually run.\n2. Use Planner / Build My Week for a batch of ideas.\n3. Mix AI Designed for new artwork, Recreate when you have inspiration, and Build a layout when the job photo is the star.\n4. Keep logos saved in Brand so you are not re-uploading.\n5. Generate captions (free), edit them, and save everything to Library.\n6. Schedule a week at a time, or download and post yourself.\n\nWork at a pace that still looks like your business. There is no guaranteed “whole month in ten minutes” in the product.',
  },
]

export const SOCIAL_P0_QUESTION_IDS = SOCIAL_P0_QUESTIONS.map((question) => question.id)
export const SOCIAL_P1_QUESTION_IDS = SOCIAL_P1_QUESTIONS.map((question) => question.id)

const SOCIAL_QUESTION_GROUPS: Record<string, string> = {
  'social-overview': 'Getting started',
  'social-first-post': 'Getting started',
  'social-ai-designed': 'Creating content',
  'social-brief': 'Creating content',
  'social-build-layout': 'Creating content',
  'social-recreate': 'Creating content',
  'social-recreate-originality': 'Creating content',
  'social-job-photos': 'Creating content',
  'social-before-after': 'Creating content',
  'social-video': 'Creating content',
  'social-planner': 'Creating content',
  'social-month-workflow': 'Creating content',
  'social-logo-variants': 'Brand & captions',
  'social-no-logo': 'Brand & captions',
  'social-change-logo': 'Brand & captions',
  'social-captions': 'Brand & captions',
  'social-brand-voice': 'Brand & captions',
  'social-renders': 'Renders',
  'social-no-render': 'Renders',
  'social-render-packs': 'Renders',
  'social-render-failure': 'Renders',
  'social-troubleshooting': 'Renders',
  'social-publishing': 'Publishing',
  'social-scheduling': 'Publishing',
  'social-platforms': 'Publishing',
  'social-save-download': 'Publishing',
  'social-team': 'Publishing',
  'social-mistakes': 'Publishing',
}

const SOCIAL_QUESTION_ORDER = Object.keys(SOCIAL_QUESTION_GROUPS)

function groupedSocialQuestions(): HelpFaqQuestion[] {
  const byId = new Map(
    [...SOCIAL_P0_QUESTIONS, ...SOCIAL_P1_QUESTIONS].map((question) => [question.id, question]),
  )
  return SOCIAL_QUESTION_ORDER.flatMap((id) => {
    const question = byId.get(id)
    if (!question) return []
    return [{ ...question, group: SOCIAL_QUESTION_GROUPS[id] }]
  })
}

export const SOCIAL_MEDIA_CATEGORY: HelpFaqCategory = {
  id: SOCIAL_HELP_CATEGORY_ID,
  title: 'Social Media',
  sidebarLabel: 'Social Media',
  description: 'Create, save, and publish branded posts - AI Designed, Recreate, Build a layout, video, and Planner.',
  icon: Megaphone,
  chipIds: ['social'],
  keywords: [
    'social',
    'post',
    'job photo',
    'before after',
    'ai designed',
    'recreate',
    'inspiration',
    'logo',
    'renders',
    'credits',
    'failed render',
    'caption',
    'facebook',
    'instagram',
    'google',
    'schedule',
    'planner',
    'build my week',
    'video',
  ],
  questions: groupedSocialQuestions(),
}

/** Old Social FAQ hashes still open the replacement article. */
export const SOCIAL_HELP_ARTICLE_ALIASES: Record<string, string> = {
  'social-media-social-posting': 'social-media-social-overview',
  'social-media-social-formats': 'social-media-social-build-layout',
  'social-media-posts-from-jobs': 'social-media-social-job-photos',
  'social-media-job-photos-social': 'social-media-social-job-photos',
  'social-media-ai-caption': 'social-media-social-captions',
  'social-media-platforms': 'social-media-social-platforms',
  'social-media-review-before-publish': 'social-media-social-publishing',
  'social-media-schedule-posts': 'social-media-social-scheduling',
  'social-media-render-credits-social': 'social-media-social-renders',
  'social-overview': 'social-media-social-overview',
  'social-first-post': 'social-media-social-first-post',
  'social-ai-designed': 'social-media-social-ai-designed',
  'social-recreate': 'social-media-social-recreate',
  'social-recreate-originality': 'social-media-social-recreate-originality',
  'social-captions': 'social-media-social-captions',
  'social-logo-variants': 'social-media-social-logo-variants',
  'social-no-logo': 'social-media-social-no-logo',
  'social-change-logo': 'social-media-social-change-logo',
  'social-renders': 'social-media-social-renders',
  'social-render-packs': 'social-media-social-render-packs',
  'social-render-failure': 'social-media-social-render-failure',
  'social-publishing': 'social-media-social-publishing',
  'social-troubleshooting': 'social-media-social-troubleshooting',
}
