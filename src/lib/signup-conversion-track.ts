import {
  attributionToClickIds,
  type AdAttribution,
} from "@/lib/ad-attribution";

declare global {
  interface Window {
    sdAttribution?: {
      identify?: (input: { email: string }) => void;
      getIdentity?: () => {
        visitorId?: string;
        sessionId?: string;
        clickIds?: Record<string, string>;
      };
    };
  }
}

export const PERFORM_ORG_ID = "59c53b3e-428d-4dd9-8b4d-5c34aa938818";
export const PERFORM_SITE_ID = "all";
export const PERFORM_CONVERT_URL =
  "https://perform-by-silicondales.vercel.app/api/attribution/convert";

export function ensureMetaFbc(attr: AdAttribution | null) {
  if (typeof document === "undefined") return;
  if (!attr?.fbc && !attr?.fbclid) return;
  const fbc = attr.fbc || `fb.1.${Date.now()}.${attr.fbclid}`;
  document.cookie = `_fbc=${encodeURIComponent(fbc)};path=/;max-age=${60 * 60 * 24 * 90};SameSite=Lax`;
}

export function trackMeta(userId: string, attr: AdAttribution | null): boolean {
  try {
    if (typeof window.fbq !== "function") return false;
    ensureMetaFbc(attr);
    window.fbq(
      "track",
      "CompleteRegistration",
      {},
      { eventID: `signup_${userId}` },
    );
    return true;
  } catch {
    return true;
  }
}

export function trackGa(): boolean {
  try {
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", "sign_up", { method: "email_otp" });
    return true;
  } catch {
    return true;
  }
}

export function trackReddit(userId: string): boolean {
  try {
    if (typeof window.rdt !== "function") return false;
    window.rdt("track", "Complete Rego", { conversionId: `signup_${userId}` });
    return true;
  } catch {
    return true;
  }
}

function readMetaCookie(name: "_fbp" | "_fbc"): string | undefined {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${name}=([^;]*)`),
    );
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildPerformPayload(
  userId: string,
  email: string | null | undefined,
  attr: AdAttribution | null,
) {
  const identity = window.sdAttribution?.getIdentity?.();
  const fromIdentity =
    identity?.clickIds && typeof identity.clickIds === "object"
      ? (identity.clickIds as Record<string, string>)
      : {};
  const clickIds: Record<string, string> = {
    ...fromIdentity,
    ...attributionToClickIds(attr),
  };

  const fbp = clickIds.fbp || readMetaCookie("_fbp");
  const fbc = clickIds.fbc || readMetaCookie("_fbc") || attr?.fbc;
  if (fbp) clickIds.fbp = fbp;
  if (fbc) clickIds.fbc = fbc;
  if (!clickIds.fbc && clickIds.fbclid) {
    clickIds.fbc = `fb.1.${Date.now()}.${clickIds.fbclid}`;
  }

  const normalized = email?.trim().toLowerCase();
  let emailHash: string | undefined;
  if (normalized) {
    window.sdAttribution?.identify?.({ email: normalized });
    try {
      emailHash = await sha256Hex(normalized);
    } catch {
      emailHash = undefined;
    }
  }

  const visitorId = identity?.visitorId || `ss_${userId}`;
  const sessionId =
    identity?.sessionId ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ss_sess_${Date.now()}`);

  return {
    orgId: PERFORM_ORG_ID,
    siteId: PERFORM_SITE_ID,
    conversionId: `signup_${userId}`,
    conversionType: "lead",
    occurredAt: new Date().toISOString(),
    value: 50,
    currency: "AUD",
    visitorId,
    sessionId,
    emailHash,
    clickIds,
    orderKeys: [] as string[],
    productIds: [] as string[],
    metadata: {
      pageUrl: window.location.href,
      source: "signup_complete",
      userId,
    },
  };
}

/** POST Perform lead; resolves true only after a 2xx response. */
export async function postPerformLead(
  userId: string,
  email: string | null | undefined,
  attr: AdAttribution | null,
): Promise<boolean> {
  try {
    const payload = await buildPerformPayload(userId, email, attr);
    const res = await fetch(PERFORM_CONVERT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("Perform convert failed", res.status, text.slice(0, 300));
      return false;
    }
    console.info("[stallside] Perform convert ok", text.slice(0, 200));
    return true;
  } catch (error) {
    console.error("Perform convert error", error);
    return false;
  }
}
