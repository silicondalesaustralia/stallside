"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    rdt?: (...args: unknown[]) => void;
    sdAttribution?: {
      trackConversion: (input: {
        conversionType: string;
        value?: number;
      }) => void;
    };
  }
}

type Props = {
  userId: string;
};

function trackPerformLead() {
  try {
    if (!window.sdAttribution?.trackConversion) return false;
    window.sdAttribution.trackConversion({
      conversionType: "lead",
      value: 0,
    });
    return true;
  } catch {
    return true;
  }
}

/** Fires Meta + GA + Reddit + Perform signup conversion once on the thank-you page. */
export default function SignupCompleteConversion({ userId }: Props) {
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

    // Perform script loads async - retry briefly so we don't miss the lead.
    if (trackPerformLead()) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (trackPerformLead() || attempts >= 20) {
        window.clearInterval(timer);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [userId]);

  return null;
}
