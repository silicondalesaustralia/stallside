import {
  attributionToClickIds,
  type AdAttribution,
} from "@/lib/ad-attribution";

declare global {
  interface Window {
    sdAttribution?: {
      identify?: (input: { email?: string; emailHash?: string }) => void;
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
export const PERFORM_COLLECT_URL =
  "https://perform-by-silicondales.vercel.app/api/attribution/collect";

type PerformIdentity = {
  visitorId: string;
  sessionId: string;
  clickIds: Record<string, string>;
};

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

function isPixelVisitorId(visitorId: string | undefined): visitorId is string {
  return Boolean(visitorId && !visitorId.startsWith("ss_"));
}

/** Wait for Perform pixel identity - never invent a synthetic visitor. */
async function waitForPerformIdentity(
  timeoutMs = 8000,
): Promise<PerformIdentity | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const raw = window.sdAttribution?.getIdentity?.();
    if (isPixelVisitorId(raw?.visitorId)) {
      return {
        visitorId: raw.visitorId,
        sessionId:
          raw.sessionId ||
          (crypto.randomUUID?.() ?? `sess_${Date.now()}`),
        clickIds:
          raw.clickIds && typeof raw.clickIds === "object"
            ? { ...raw.clickIds }
            : {},
      };
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

function mergeClickIds(
  identityClicks: Record<string, string>,
  attr: AdAttribution | null,
): Record<string, string> {
  const clickIds: Record<string, string> = {
    ...identityClicks,
    ...attributionToClickIds(attr),
  };
  const fbp = clickIds.fbp || readMetaCookie("_fbp");
  const fbc = clickIds.fbc || readMetaCookie("_fbc") || attr?.fbc;
  if (fbp) clickIds.fbp = fbp;
  if (fbc) clickIds.fbc = fbc;
  if (!clickIds.fbc && clickIds.fbclid) {
    clickIds.fbc = `fb.1.${Date.now()}.${clickIds.fbclid}`;
  }
  return clickIds;
}

async function postPerformIdentify(input: {
  visitorId: string;
  sessionId: string;
  emailHash: string;
  clickIds: Record<string, string>;
  userId: string;
}): Promise<void> {
  // Pixel helper (async hash path) + explicit collect so email stitches to visitor.
  window.sdAttribution?.identify?.({ emailHash: input.emailHash });

  await fetch(PERFORM_COLLECT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orgId: PERFORM_ORG_ID,
      siteId: PERFORM_SITE_ID,
      eventType: "identify",
      occurredAt: new Date().toISOString(),
      visitorId: input.visitorId,
      sessionId: input.sessionId,
      pageUrl: window.location.href,
      clickIds: input.clickIds,
      metadata: {
        emailHash: input.emailHash,
        identifySource: "signup_complete",
        userId: input.userId,
      },
    }),
    keepalive: true,
    mode: "cors",
  });
}

/**
 * POST Perform lead using the real pixel visitorId (no ss_ fallback).
 * Returns false if the pixel identity is not ready yet so the caller can retry.
 */
export async function postPerformLead(
  userId: string,
  email: string | null | undefined,
  attr: AdAttribution | null,
): Promise<boolean> {
  try {
    if (!window.sdAttribution?.getIdentity) return false;

    const identity = await waitForPerformIdentity(2500);
    if (!identity) {
      console.warn("[stallside] Perform pixel visitor not ready yet");
      return false;
    }

    const clickIds = mergeClickIds(identity.clickIds, attr);
    const normalized = email?.trim().toLowerCase();
    let emailHash: string | undefined;
    if (normalized) {
      try {
        emailHash = await sha256Hex(normalized);
      } catch {
        emailHash = undefined;
      }
    }

    if (emailHash) {
      try {
        await postPerformIdentify({
          visitorId: identity.visitorId,
          sessionId: identity.sessionId,
          emailHash,
          clickIds,
          userId,
        });
      } catch (error) {
        console.error("[stallside] Perform identify failed", error);
      }
    }

    const payload = {
      orgId: PERFORM_ORG_ID,
      siteId: PERFORM_SITE_ID,
      conversionId: `signup_${userId}`,
      conversionType: "lead",
      occurredAt: new Date().toISOString(),
      value: 50,
      currency: "AUD",
      visitorId: identity.visitorId,
      sessionId: identity.sessionId,
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
    console.info("[stallside] Perform convert ok", {
      visitorId: identity.visitorId,
      hasEmailHash: Boolean(emailHash),
      clickIdKeys: Object.keys(clickIds),
      body: text.slice(0, 200),
    });
    return true;
  } catch (error) {
    console.error("Perform convert error", error);
    return false;
  }
}
