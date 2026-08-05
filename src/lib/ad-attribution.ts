/** First-party cookie + signup payload for Meta/Google click ids. */
export const AD_ATTR_COOKIE = "ss_ad_attr";
export const AD_ATTR_MAX_AGE_SEC = 60 * 60 * 24 * 90;

const CLICK_KEYS = [
  "fbclid",
  "fbc",
  "fbp",
  "gclid",
  "gbraid",
  "wbraid",
  "ttclid",
  "msclkid",
  "rdt_cid",
] as const;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type AdAttribution = {
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ttclid?: string;
  msclkid?: string;
  rdt_cid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landingUrl?: string;
  capturedAt?: string;
};

function clip(value: unknown, max = 512): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

/** Keep only known attribution keys; drop empties. */
export function normalizeAttribution(raw: unknown): AdAttribution | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const out: AdAttribution = {};
  for (const key of [...CLICK_KEYS, ...UTM_KEYS]) {
    const v = clip(src[key]);
    if (v) out[key] = v;
  }
  const landingUrl = clip(src.landingUrl, 2048);
  if (landingUrl) out.landingUrl = landingUrl;
  const capturedAt = clip(src.capturedAt, 64);
  if (capturedAt) out.capturedAt = capturedAt;
  return Object.keys(out).length > 0 ? out : null;
}

export function mergeAttribution(
  ...parts: Array<AdAttribution | null | undefined>
): AdAttribution | null {
  const out: AdAttribution = {};
  for (const part of parts) {
    if (!part) continue;
    for (const [k, v] of Object.entries(part)) {
      if (typeof v === "string" && v && !(k in out)) {
        (out as Record<string, string>)[k] = v;
      }
    }
  }
  if (!out.fbc && out.fbclid) {
    out.fbc = `fb.1.${Date.now()}.${out.fbclid}`;
  }
  if (!out.capturedAt && Object.keys(out).length > 0) {
    out.capturedAt = new Date().toISOString();
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function attributionFromFormData(
  formData: FormData,
): AdAttribution | null {
  const raw = String(formData.get("adAttribution") ?? "").trim();
  if (!raw) return null;
  try {
    return normalizeAttribution(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Perform / Meta click id bag (no UTMs). */
export function attributionToClickIds(
  attr: AdAttribution | null | undefined,
): Record<string, string> {
  if (!attr) return {};
  const out: Record<string, string> = {};
  for (const key of CLICK_KEYS) {
    const v = attr[key];
    if (v) out[key] = v;
  }
  return out;
}

export function hasFacebookClick(
  attr: AdAttribution | null | undefined,
): boolean {
  return Boolean(attr?.fbclid || attr?.fbc);
}
