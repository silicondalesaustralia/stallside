"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    rdt?: (...args: unknown[]) => void;
  }
}

type Props = {
  userId: string;
};

/** Fires Meta + GA + Reddit signup conversion once on the thank-you page. */
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
  }, [userId]);

  return null;
}
