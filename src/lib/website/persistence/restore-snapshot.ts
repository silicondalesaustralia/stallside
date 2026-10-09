/**
 * Draft keys with their own publish flow (blog posts publish individually,
 * redirects publish on their own). Restoring an old site snapshot keeps the
 * current values so deleted posts don't come back and new ones aren't lost.
 */
export const INDEPENDENTLY_PUBLISHED_KEYS = [
  "blogPosts",
  "blogTopics",
  "storefrontRedirects",
] as const;

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function snapshotForRestore(snapshot: unknown, currentDraft: unknown) {
  const next = { ...asRecord(snapshot) };
  const current = asRecord(currentDraft);
  for (const key of INDEPENDENTLY_PUBLISHED_KEYS) {
    if (key in current) next[key] = current[key];
    else delete next[key];
  }
  return next;
}
