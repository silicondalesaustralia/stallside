const DEFAULT_UTM_CONTENT = "lp-missed-sales";

const FORWARD_KEYS = new Set([
  "fbclid",
  "gclid",
  "ttclid",
  "msclkid",
  "li_fat_id",
]);

function shouldForward(key: string): boolean {
  const lower = key.toLowerCase();
  if (FORWARD_KEYS.has(lower)) return true;
  if (lower.startsWith("utm_")) return true;
  return false;
}

/** Build /signup href preserving inbound tracking params for Meta LP CTAs. */
export function lpSignupHref(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const out = new URLSearchParams();

  for (const [key, raw] of Object.entries(searchParams)) {
    if (!shouldForward(key)) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value == null || value === "") continue;
    out.set(key, value);
  }

  if (!out.has("utm_content")) {
    out.set("utm_content", DEFAULT_UTM_CONTENT);
  }

  const qs = out.toString();
  return qs ? `/signup?${qs}` : "/signup";
}
