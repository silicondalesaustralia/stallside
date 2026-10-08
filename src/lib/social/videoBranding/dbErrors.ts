/** Postgres unique_violation */
export function isPostgresUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = (error as { code?: string }).code
  return code === '23505'
}

export const BRANDING_IN_PROGRESS_ERROR =
  'Branding is already in progress for this video.'
