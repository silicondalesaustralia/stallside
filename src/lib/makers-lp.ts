export const MAKERS_LP_PATH = "/lp/makers";
export const MAKERS_LP_CAMPAIGN = "makers";
export const MAKERS_LP_SIGNUP_HREF = "/signup?utm_content=lp-makers";

const FORWARD_KEYS = new Set(["fbclid", "gclid", "ttclid", "msclkid", "li_fat_id"]);

/** Signup href with the page's ad params (utm_*, click ids) plus any extra params such as plan=pro. */
export function makersLpSignupHref(search: string, extra: Record<string, string> = {}): string {
  const out = new URLSearchParams({ utm_content: "lp-makers", ...extra });
  new URLSearchParams(search).forEach((value, key) => {
    const lower = key.toLowerCase();
    if (value && (FORWARD_KEYS.has(lower) || lower.startsWith("utm_"))) out.set(key, value);
  });
  return `/signup?${out.toString()}`;
}

/** GA event for landing-page interactions; no-op when analytics is not loaded. */
export function trackMakersLpEvent(name: string, params: Record<string, string> = {}): void {
  try {
    window.gtag?.("event", name, { campaign: MAKERS_LP_CAMPAIGN, ...params });
  } catch (error) {
    console.error(`[lp] ${name} tracking failed`, error);
  }
}
