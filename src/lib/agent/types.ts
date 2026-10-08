export const SOCIAL_LOOKBACK_DAYS = 7
export const QUOTE_FOLLOWUP_MIN_DAYS = 5
export const QUOTE_FOLLOWUP_MAX_DAYS = 14
export const MAX_SOCIAL_SUGGESTIONS = 5
export const MAX_FOLLOWUP_SUGGESTIONS = 5
export const MAX_INVOICE_REMINDER_SUGGESTIONS = 5
export const INVOICE_REMINDER_DEDUP_DAYS = 14
export const UNSCHEDULED_JOB_MIN_AGE_DAYS = 3
export const UNSCHEDULED_JOB_MAX_AGE_DAYS = 60
export const UNSCHEDULED_JOB_RENUDGE_DAYS = 7
export const MAX_UNSCHEDULED_JOB_SUGGESTIONS = 5
export const SKIP_RESURVEY_DAYS = 30

export type AgentSuggestionType =
  | 'social_post'
  | 'quote_followup'
  | 'invoice_reminder'
  | 'unscheduled_job'
export type AgentSuggestionStatus =
  | 'pending'
  | 'approved'
  | 'skipped'
  | 'executed'
  | 'failed'

import type { ContentFormat, InfographicPreset, PhotoSource } from '@/lib/social/composeModel'

export type SocialDraftContent = {
  job_id: string
  job_title: string
  suburb: string
  state: string
  stage: string
  category_id: 'show_our_work'
  subtype_id: 'completed_job'
  format?: ContentFormat
  photo_source?: PhotoSource
  infographic_preset?: InfographicPreset
  photo_url: string | null
  caption: string
  caption_options: string[]
}

export type QuoteFollowupDraftContent = {
  quote_id: string
  quote_number: string
  amount: number
  amount_label: string
  customer_first_name: string
  customer_phone: string
  public_token: string
  sent_at: string
  sms_body: string
}

export type InvoiceReminderDraftContent = {
  invoice_id: string
  invoice_number: string
  amount: number
  amount_label: string
  customer_first_name: string
  customer_phone: string
  public_token: string
  due_date: string
  days_overdue: number
  sms_body: string
}

export type UnscheduledJobDraftContent = {
  job_id: string
  job_title: string
  stage: string
  suburb: string
  customer_name: string
  created_at: string
  days_unscheduled: number
  calendar_deep_link: string
}

export type SuggestionDraft =
  | { type: 'social_post'; sourceId: string; draft: SocialDraftContent }
  | { type: 'quote_followup'; sourceId: string; draft: QuoteFollowupDraftContent }
  | { type: 'invoice_reminder'; sourceId: string; draft: InvoiceReminderDraftContent }
  | { type: 'unscheduled_job'; sourceId: string; draft: UnscheduledJobDraftContent }

export type SurveyInsertResult = {
  inserted: number
  skippedExisting: number
  drafts: SuggestionDraft[]
  errors: string[]
}
