import { TRACKING_FIELD_BY_KEY } from "../fields";
import type { StorefrontTracking, TrackingIdKey } from "../types";

export type InstallCheckLine = { label: string; ok: boolean; detail: string };

export type InstallCheckResult =
  | { ok: true; url: string; lines: InstallCheckLine[] }
  | { ok: false; url: string; error: string };

const TIMEOUT_MS = 10_000;

const VERIFICATION_META: Partial<Record<TrackingIdKey, string>> = {
  gscVerification: "google-site-verification",
  bingVerification: "msvalidate.01",
  metaDomainVerification: "facebook-domain-verification",
  pinterestDomainVerify: "p:domain_verify",
};

function hasMetaTag(html: string, name: string, content: string): boolean {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags.some((tag) => tag.includes(`name="${name}"`) && tag.includes(`content="${content}"`));
}

/**
 * Fetches the live homepage and confirms each live tag is on it. Pixel ids are passed to
 * the page's tag loader, so they appear in the HTML even though the scripts load in the browser.
 */
export async function checkTrackingInstall(url: string, live: StorefrontTracking): Promise<InstallCheckResult> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "VendlTagsCheck/1.0 (+https://vendl.app)" },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, url, error: `Your homepage returned HTTP ${res.status}.` };
    html = await res.text();
  } catch (error) {
    return { ok: false, url, error: error instanceof Error ? `Couldn't load your homepage: ${error.message}` : "Couldn't load your homepage." };
  }

  const lines: InstallCheckLine[] = [];
  for (const [key, value] of Object.entries(live.ids) as [TrackingIdKey, string][]) {
    const label = TRACKING_FIELD_BY_KEY.get(key)?.label ?? key;
    const metaName = VERIFICATION_META[key];
    const found = metaName ? hasMetaTag(html, metaName, value) : html.includes(value);
    lines.push({
      label,
      ok: found,
      detail: found
        ? metaName ? "Meta tag is in your page head." : "Tag is installed on your homepage."
        : "Not found on your homepage. Make tags live, then check again in a minute.",
    });
  }
  if (live.customHead.trim()) {
    lines.push({ label: "Custom code", ok: true, detail: "Saved. Use test mode to confirm it runs." });
  }
  return { ok: true, url, lines };
}
