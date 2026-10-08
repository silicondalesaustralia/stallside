/**
 * Quote card hybrid compose copy - user-entered only (never AI-generated).
 */

import { z } from 'zod'

export const QUOTE_TEXT_MAX = 320
export const QUOTE_CUSTOMER_NAME_MAX = 50
export const QUOTE_INTRO_LINE_MAX = 80
export const QUOTE_CTA_LINE_MAX = 50

export const quoteCardContentSchema = z.object({
  quoteText: z.string().min(1).max(QUOTE_TEXT_MAX),
  customerName: z.string().min(1).max(QUOTE_CUSTOMER_NAME_MAX),
  starRating: z.number().int().min(1).max(5).optional(),
  introLine: z.string().max(QUOTE_INTRO_LINE_MAX).optional(),
  ctaLine: z.string().max(QUOTE_CTA_LINE_MAX).optional(),
})

export type QuoteCardContent = z.infer<typeof quoteCardContentSchema>

export function parseQuoteCardContent(raw: unknown): QuoteCardContent {
  return quoteCardContentSchema.parse(raw)
}

/** Empty form defaults - user must fill quoteText and customerName before render. */
export function buildEmptyQuoteCardContent(): {
  quoteText: string
  customerName: string
  starRating?: number
  introLine: string
  ctaLine: string
} {
  return {
    quoteText: '',
    customerName: '',
    introLine: '',
    ctaLine: '',
  }
}
