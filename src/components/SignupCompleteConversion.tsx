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

function trackPerformLead(email: string | null | undefined) {
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

/** Fires Meta + GA + Reddit + Perform signup conversion once on the thank-you page. */
export default function SignupCompleteConversion({ userId, email }: Props) {
  useEffect(() => {
    try {
      window.fbq?.("track", "CompleteRegistration");
    } catch {
      /* ignore */
    }
    try {
      window.gtag?.("event", "sign_up", { method: "email_otp" });
    } catch {
      /* ignore */
    }
    try {
      // Stable ID so pixel + CAPI can dedupe the same signup.
      window.rdt?.("track", "Complete Rego", {
        conversionId: `signup_${userId}`,
      });
    } catch {
      /* ignore */
    }

    const onceKey = `perform_lead_${userId}`;
    try {
      if (sessionStorage.getItem(onceKey) === "1") return;
    } catch {
      /* ignore */
    }

    const markOnce = () => {
      try {
        sessionStorage.setItem(onceKey, "1");
      } catch {
        /* ignore */
      }
    };

    // Perform script loads async - retry briefly so we don't miss the lead.
    if (trackPerformLead(email)) {
      markOnce();
      return;
    }
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (trackPerformLead(email)) {
        markOnce();
        window.clearInterval(timer);
        return;
      }
      if (attempts >= 20) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [userId, email]);

  return null;
}
