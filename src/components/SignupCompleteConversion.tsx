"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    rdt?: (...args: unknown[]) => void;
  }
}

/** Fires Meta + GA + Reddit signup conversion once on the thank-you page. */
export default function SignupCompleteConversion() {
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
      window.rdt?.("track", "SignUp");
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
