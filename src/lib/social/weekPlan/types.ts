export const WEEK_PLAN_STATUSES = ['draft', 'plan_approved', 'archived'] as const
export type WeekPlanStatus = (typeof WEEK_PLAN_STATUSES)[number]

export const WEEK_PLAN_GENERATION_STATUSES = [
  'not_started',
  'queued',
  'generating',
  'ready',
  'partial_failed',
  'failed',
] as const
export type WeekPlanGenerationStatus = (typeof WEEK_PLAN_GENERATION_STATUSES)[number]

export const WEEK_PLAN_REVIEW_STATUSES = [
  'needs_selection',
  'selected',
  'approved',
  'scheduled',
  'skipped',
] as const
export type WeekPlanReviewStatus = (typeof WEEK_PLAN_REVIEW_STATUSES)[number]

export const WEEK_PLAN_QUICK_CHANGE_MAX_CHARS = 800

export const WEEK_PLAN_ITEM_STATUSES = ['planned'] as const
export type WeekPlanItemStatus = (typeof WEEK_PLAN_ITEM_STATUSES)[number]

export const WEEK_PLAN_ITEM_GENERATION_STATUSES = [
  'not_started',
  'queued',
  'generating',
  'generated',
  'failed',
] as const
export type WeekPlanItemGenerationStatus =
  (typeof WEEK_PLAN_ITEM_GENERATION_STATUSES)[number]

export const WEEK_PLAN_PLATFORMS = ['facebook', 'instagram', 'gmb'] as const
export type WeekPlanPlatform = (typeof WEEK_PLAN_PLATFORMS)[number]

/** Wizard-facing content mix options (Phase A). Customer review excluded. */
export const WEEK_PLAN_CONTENT_MIX = [
  'recent_jobs',
  'services',
  'tips_advice',
  'promotions',
  'seasonal',
  'team_business',
] as const
export type WeekPlanContentMix = (typeof WEEK_PLAN_CONTENT_MIX)[number]

/** Canonical planner / storage post types. */
export const WEEK_PLAN_POST_TYPES = [
  'recent_job',
  'services',
  'tips_advice',
  'promotions',
  'seasonal',
  'team_business',
] as const
export type WeekPlanPostType = (typeof WEEK_PLAN_POST_TYPES)[number]

export type WeekPlanWizardAnswers = {
  postCount: number
  contentMix: WeekPlanContentMix[]
  chooseForMe: boolean
  priorityText: string | null
  selectedJobIds: string[]
  platforms: WeekPlanPlatform[]
}

export type WeekPlanRow = {
  id: string
  business_id: string
  week_start_date: string
  status: WeekPlanStatus
  generation_status: WeekPlanGenerationStatus
  post_count_target: number
  wizard_answers: WeekPlanWizardAnswers
  created_by_user_id: string | null
  approved_by_user_id: string | null
  approved_at: string | null
  generation_started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

/** Persisted preview - includes fields needed for finalize / logo reapply. */
export type WeekPlanVariantPreviewStored = {
  id: string
  index: number
  label: string
  imageUrl: string
  storagePath: string
  baseStoragePath?: string
  messageAngle: string
  userBrief?: string | null
  intentChip?: string | null
  jobId?: string | null
  visualPath?: string
  imageModel?: string | null
  logoAssetId?: string | null
  logoVariantType?: string | null
  logoDisabled?: boolean
  logoPosition?: string | null
  logoSize?: string | null
}

export type WeekPlanItemRow = {
  id: string
  plan_id: string
  business_id: string
  sort_order: number
  target_date: string
  post_type: WeekPlanPostType
  subtype_id: string | null
  intent_chip: string | null
  topic: string
  user_brief: string | null
  job_id: string | null
  platforms: WeekPlanPlatform[]
  caption: string | null
  status: WeekPlanItemStatus
  generation_id: string | null
  generation_status: WeekPlanItemGenerationStatus
  generation_error: string | null
  variant_previews: WeekPlanVariantPreviewStored[] | null
  variant_previews_previous: WeekPlanVariantPreviewStored[] | null
  selected_variant_id: string | null
  review_status: WeekPlanReviewStatus
  hybrid_render_id: string | null
  scheduled_social_post_id: string | null
  approved_at: string | null
  skipped_at: string | null
  generation_started_at: string | null
  generation_completed_at: string | null
  created_at: string
  updated_at: string
}

export type WeekPlanRecentJob = {
  id: string
  title: string
  suburb: string
  state: string
  stage: string
}

export type PlannerRawItem = {
  targetDate: string
  postType: string
  topic: string
  jobId?: string | null
  subtypeId?: string | null
  intentChip?: string | null
  userBrief?: string | null
}

export const WEEK_PLAN_PRIORITY_MAX_CHARS = 2000
export const WEEK_PLAN_TOPIC_MAX_CHARS = 200
export const WEEK_PLAN_MIN_POSTS = 1
export const WEEK_PLAN_MAX_POSTS = 7
export const WEEK_PLAN_DEFAULT_POSTS = 4
