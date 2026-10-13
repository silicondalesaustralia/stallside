/** True for `true`/`1`, ignoring case, surrounding whitespace/newlines and quotes pasted into env dashboards. */
export function envFlag(value: string | undefined): boolean {
  const v = value?.trim().replace(/^["']|["']$/g, '').trim().toLowerCase()
  return v === 'true' || v === '1'
}
