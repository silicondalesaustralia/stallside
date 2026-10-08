export const AI_IMAGE_PURPOSES = [
  { id: 'job_showcase', label: 'Job Showcase' },
  { id: 'promo',        label: 'Promo' },
  { id: 'review',       label: 'Review' },
  { id: 'team',         label: 'Team' },
] as const

export type AiImagePurpose = (typeof AI_IMAGE_PURPOSES)[number]['id']

export const AI_IMAGE_STYLES = [
  {
    id:             'photorealistic',
    label:          'Photorealistic',
    promptFragment: 'photorealistic photography, natural lighting, high detail, realistic textures',
  },
  {
    id:             'cartoon',
    label:          'Cartoon',
    promptFragment: 'flat vector cartoon illustration style, bold outlines, simple shapes, vibrant colours',
  },
  {
    id:             'illustration',
    label:          'Illustration',
    promptFragment: 'digital illustration style, artistic hand-drawn feel, clean composition, rich colours',
  },
  {
    id:             'bold_ad',
    label:          'Bold/Ad-style',
    promptFragment: 'bold advertising visual style, high contrast, dramatic composition, marketing poster energy',
  },
  {
    id:             'minimal',
    label:          'Minimal/Clean',
    promptFragment: 'minimal clean aesthetic, ample negative space, simple elegant composition, muted professional palette',
  },
] as const

export type AiImageStyleId = (typeof AI_IMAGE_STYLES)[number]['id']

const STYLE_BY_ID = new Map(AI_IMAGE_STYLES.map((s) => [s.id, s]))

export function getAiImageStyle(styleId: string) {
  return STYLE_BY_ID.get(styleId as AiImageStyleId) ?? null
}

export const MAX_AI_IMAGE_REGENERATES = 3
export const MAX_AI_IMAGE_EXTRA_DETAIL = 150
export const MAX_AI_IMAGE_CUSTOM_PROMPT = 2000

export type AiImagePromptMode = 'guided' | 'custom'

export type AiImageMode = 'photo' | 'full_post'

export const AI_IMAGE_MODES: { id: AiImageMode; label: string; description: string }[] = [
  {
    id:          'photo',
    label:       'AI Photo Only',
    description: 'Clean scene image - flows into your template in Steps 3-5',
  },
  {
    id:          'full_post',
    label:       'AI Full Post',
    description: 'Complete graphic with your business name - skip to caption',
  },
]

export interface AiImageSceneOption {
  id:                    string
  purpose:               string
  scene_label:           string
  scene_prompt_fragment: string
  sort_order:            number
}
