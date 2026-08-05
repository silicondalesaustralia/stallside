import {
  attributionToClickIds,
  type AdAttribution,
} from "@/lib/ad-attribution";

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

export function trackPerformLead(
  userId: string,
  email: string | null | undefined,
  attr: AdAttribution | null,
): boolean {
  try {
    const api = window.sdAttribution;
    if (!api?.trackConversion) return false;
    const normalized = email?.trim().toLowerCase();
    if (normalized) api.identify?.({ email: normalized });
    api.trackConversion({
      conversionType: "lead",
      value: 50,
      currency: "AUD",
      conversionId: `signup_${userId}`,
      clickIds: attributionToClickIds(attr),
    });
    return true;
  } catch {
    return true;
  }
}
