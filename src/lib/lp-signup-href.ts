const DEFAULT_UTM_CONTENT = "lp-missed-sales";

export const LP_DEFAULT_SIGNUP_HREF = `/signup?utm_content=${DEFAULT_UTM_CONTENT}`;

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

/**
 * Tiny inline script: rewrites [data-lp-cta] hrefs from location.search.
 * Keeps existing query on the link (e.g. vertical=) and merges tracking params.
 */
export const LP_CTA_PARAM_SCRIPT = `(function(){try{var F={fbclid:1,gclid:1,ttclid:1,msclkid:1,li_fat_id:1};var q=new URLSearchParams(location.search);document.querySelectorAll("[data-lp-cta]").forEach(function(a){var raw=a.getAttribute("href")||"/signup";var u;try{u=new URL(raw,location.origin)}catch(e){u=new URL("/signup",location.origin)}var o=new URLSearchParams(u.search);q.forEach(function(v,k){var l=k.toLowerCase();if(F[l]||l.indexOf("utm_")==0)o.set(k,v)});if(!o.has("utm_content"))o.set("utm_content","${DEFAULT_UTM_CONTENT}");a.setAttribute("href",u.pathname+"?"+o.toString())})}catch(e){}})();`;
