import type { AdAttribution } from "@/lib/ad-attribution";

type SdConversionInput = {
  conversionId: string;
  conversionType: string;
  value: number;
  currency: string;
  emailHash?: string;
  metadata?: Record<string, unknown>;
};

declare global {
  interface Window {
    sdAttribution?: {
      trackConversion?: (input: SdConversionInput) => void;
      identify?: (input: { email?: string; emailHash?: string }) => void;
      getIdentity?: () => {
        visitorId?: string;
        sessionId?: string;
        clickIds?: Record<string, string>;
      };
    };
  }
}

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

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashEmail(
  email: string | null | undefined,
): Promise<string | undefined> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return undefined;
  try {
    return await sha256Hex(normalized);
  } catch (error) {
    console.error("[stallside] email hash failed", error);
    return undefined;
  }
}

/**
 * Sends identify + lead through the loaded StitchStack script, which supplies
 * its own host, orgId, siteId, viewId, visitor and click IDs.
 * Returns false until the script is loaded so the caller can retry.
 */
export async function postPerformLead(
  userId: string,
  email: string | null | undefined,
  attr: AdAttribution | null,
): Promise<boolean> {
  const sd = window.sdAttribution;
  if (!sd?.trackConversion) return false;
  try {
    ensureMetaFbc(attr);
    const emailHash = await hashEmail(email);
    if (emailHash) sd.identify?.({ emailHash });
    sd.trackConversion({
      conversionId: `signup_${userId}`,
      conversionType: "lead",
      value: 50,
      currency: "AUD",
      emailHash,
      metadata: { source: "signup_complete", userId },
    });
    console.info("[stallside] StitchStack lead sent", {
      conversionId: `signup_${userId}`,
      hasEmailHash: Boolean(emailHash),
    });
    return true;
  } catch (error) {
    console.error("[stallside] StitchStack lead failed", error);
    return false;
  }
}
