/** Strip quotes/whitespace that break HTTP headers when pasted into Vercel env. */
export function cleanEnvSecret(value: string | undefined): string | null {
  if (!value) return null;
  const cleaned = value
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/[\r\n\0]/g, "")
    .trim();
  return cleaned || null;
}
