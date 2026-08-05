"use client";

import { useEffect } from "react";
import {
  AD_ATTR_COOKIE,
  mergeAttribution,
  normalizeAttribution,
  type AdAttribution,
} from "@/lib/ad-attribution";
import {
  trackGa,
  trackMeta,
  trackPerformLead,
  trackReddit,
} from "@/lib/signup-conversion-track";

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
        conversionId?: string;
        clickIds?: Record<string, string>;
      }) => void;
    };
  }
}

type Props = {
  userId: string;
  email?: string | null;
  adAttribution?: AdAttribution | null;
};

const RETRY_MS = 250;
const MAX_ATTEMPTS = 40;

function readCookieAttr(): AdAttribution | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${AD_ATTR_COOKIE}=([^;]*)`),
    );
    if (!match?.[1]) return null;
    return normalizeAttribution(JSON.parse(decodeURIComponent(match[1])));
  } catch {
    return null;
  }
}

/**
 * Fires Meta + GA + Reddit + Perform signup conversion on the thank-you page.
 * Retries until each pixel stub is available; always forwards stored fbclid.
 */
export default function SignupCompleteConversion({
  userId,
  email,
  adAttribution,
}: Props) {
  useEffect(() => {
    const onceKey = `signup_conversion_${userId}`;
    try {
      if (sessionStorage.getItem(onceKey) === "1") return;
    } catch {
      /* ignore */
    }

    const attr = mergeAttribution(adAttribution, readCookieAttr());
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
      if (!metaDone) metaDone = trackMeta(userId, attr);
      if (!gaDone) gaDone = trackGa();
      if (!redditDone) redditDone = trackReddit(userId);
      if (!performDone) performDone = trackPerformLead(userId, email, attr);
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
        if (metaDone || gaDone || redditDone || performDone) markAllOnce();
        window.clearInterval(timer);
      }
    }, RETRY_MS);

    return () => window.clearInterval(timer);
  }, [userId, email, adAttribution]);

  return null;
}
