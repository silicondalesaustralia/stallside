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
      getIdentity?: () => {
        visitorId?: string;
        sessionId?: string;
        clickIds?: Record<string, string>;
      };
      trackConversion?: (input: {
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
/** Bump when convert transport changes so stale session locks cannot skip Perform. */
const ONCE_VER = "v3";

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

function onceGet(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function onceSet(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Fires Meta + GA + Reddit + Perform signup conversion on the thank-you page.
 * Each channel has its own once-key so a prior Meta fire cannot skip Perform.
 */
export default function SignupCompleteConversion({
  userId,
  email,
  adAttribution,
}: Props) {
  useEffect(() => {
    const metaKey = `signup_meta_${ONCE_VER}_${userId}`;
    const gaKey = `signup_ga_${ONCE_VER}_${userId}`;
    const redditKey = `signup_reddit_${ONCE_VER}_${userId}`;
    const performKey = `signup_perform_${ONCE_VER}_${userId}`;

    const attr = mergeAttribution(adAttribution, readCookieAttr());
    let metaDone = onceGet(metaKey);
    let gaDone = onceGet(gaKey);
    let redditDone = onceGet(redditKey);
    let performDone = onceGet(performKey);
    let attempts = 0;

    if (metaDone && gaDone && redditDone && performDone) return;

    const tick = () => {
      if (!metaDone && trackMeta(userId, attr)) {
        metaDone = true;
        onceSet(metaKey);
      }
      if (!gaDone && trackGa()) {
        gaDone = true;
        onceSet(gaKey);
      }
      if (!redditDone && trackReddit(userId)) {
        redditDone = true;
        onceSet(redditKey);
      }
      if (!performDone && trackPerformLead(userId, email, attr)) {
        performDone = true;
        onceSet(performKey);
      }
      if (metaDone && gaDone && redditDone && performDone) {
        window.clearInterval(timer);
      }
    };

    tick();
    const timer = window.setInterval(() => {
      attempts += 1;
      tick();
      if (attempts >= MAX_ATTEMPTS) window.clearInterval(timer);
    }, RETRY_MS);

    return () => window.clearInterval(timer);
  }, [userId, email, adAttribution]);

  return null;
}
