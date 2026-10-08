import { randomUUID } from 'crypto'

/** 1 render credit = 3 AI Designed versions. Selecting visuals does not change this. */
export const AI_DESIGNED_SET_CREDIT_COST = 1
export const AI_DESIGNED_USE_THIS_CREDIT_COST = 0
export const AI_DESIGNED_LOGO_CHANGE_CREDIT_COST = 0

const GENERATION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Same generationId retries the same prepaid run - do not charge twice. */
export function parseDesignedGenerationId(raw: unknown): string {
  if (typeof raw === 'string' && GENERATION_ID_RE.test(raw.trim())) return raw.trim()
  return randomUUID()
}

export function shouldRefundDesignedGeneration(succeededCount: number): boolean {
  return succeededCount <= 0
}
