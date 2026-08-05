"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    rdt?: (...args: unknown[]) => void;
    sdAttribution?: {
      identify?: (input: { email: string }) => void;
      trackConversion: (input: {
        conversionType: string;
        value?: number;
        currency?: string;
      }) => void;
    };
  }
}

type Props = {
  userId: string;
  email?: string | null;
};

const RETRY_MS = 250;
const MAX_ATTEMPTS = 40;

function trackMeta(): boolean {
  try {
    if (typeof window.fbq !== "function") return false;
    window.fbq("track", "CompleteRegistration");
    return true;
  } catch {
    return true;
  }
}

function trackGa(): boolean {
  try {
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", "sign_up", { method: "email_otp" });
    return true;
  } catch {
    return true;
  }
}

function trackReddit(userId: string): boolean {
  try {
    if (typeof window.rdt !== "function") return false;
    window.rdt("track", "Complete Rego", {
      conversionId: `signup_${userId}`,
    });
    return true;
  } catch {
    return true;
  }
}

function trackPerformLead(email: string | null | undefined): boolean {
  try {
    const api = window.sdAttribution;
    if (!api?.trackConversion) return false;

    const normalized = email?.trim().toLowerCase();
    if (normalized) {
      api.identify?.({ email: normalized });
    }

    api.trackConversion({
      conversionType: "lead",
      value: 50,
      currency: "AUD",
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Fires Meta + GA + Reddit + Perform signup conversion on the thank-you page.
 * Retries until each pixel stub is available - OTP redirect often races afterInteractive scripts.
 */
export default function SignupCompleteConversion({ userId, email }: Props) {
  useEffect(() => {
    const onceKey = `signup_conversion_${userId}`;
    try {
      if (sessionStorage.getItem(onceKey) === "1") return;
    } catch {
      /* ignore */
    }

    let metaDone = false;
    let gaDone = false;
    let redditDone = false;
    let performDone = false;
    let attempts = 0;

    const markAllOnce = () => {
      try {
        sessionStorage.setItem(onceKey, "1");
      } catch {
        /* ignore */
      }
    };

    const tick = () => {
      if (!metaDone) metaDone = trackMeta();
      if (!gaDone) gaDone = trackGa();
      if (!redditDone) redditDone = trackReddit(userId);
      if (!performDone) performDone = trackPerformLead(email);

      if (metaDone && gaDone && redditDone && performDone) {
        markAllOnce();
        window.clearInterval(timer);
      }
    };

    tick();
    const timer = window.setInterval(() => {
      attempts += 1;
      tick();
      if (attempts >= MAX_ATTEMPTS) {
        // Persist if anything fired so a refresh does not double-count those.
        if (metaDone || gaDone || redditDone || performDone) markAllOnce();
        window.clearInterval(timer);
      }
    }, RETRY_MS);

    return () => window.clearInterval(timer);
  }, [userId, email]);

  return null;
}
