"use client";

import { useEffect } from "react";
import {
  AD_ATTR_COOKIE,
  mergeAttribution,
  normalizeAttribution,
  type AdAttribution,
} from "@/lib/ad-attribution";
import {
  postPerformLead,
  trackGa,
  trackMeta,
  trackReddit,
} from "@/lib/signup-conversion-track";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    rdt?: (...args: unknown[]) => void;
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

type Props = {
  userId: string;
  email?: string | null;
  adAttribution?: AdAttribution | null;
};

const RETRY_MS = 250;
const MAX_ATTEMPTS = 60;
const ONCE_VER = "v5";

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
 * Fires Meta + GA + Reddit + Perform on the thank-you page.
 * Perform only locks after a successful convert HTTP response.
 */
export default function SignupCompleteConversion({
  userId,
  email,
  adAttribution,
}: Props) {
  useEffect(() => {
    const attr = mergeAttribution(adAttribution, readCookieAttr());
    const metaKey = `signup_meta_${ONCE_VER}_${userId}`;
    const gaKey = `signup_ga_${ONCE_VER}_${userId}`;
    const redditKey = `signup_reddit_${ONCE_VER}_${userId}`;
    const performKey = `signup_perform_${ONCE_VER}_${userId}`;

    let metaDone = onceGet(metaKey);
    let gaDone = onceGet(gaKey);
    let redditDone = onceGet(redditKey);
    let performDone = onceGet(performKey);
    let performInFlight = false;
    let attempts = 0;
    let timer = 0;

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
      if (!performDone && !performInFlight) {
        performInFlight = true;
        void postPerformLead(userId, email, attr).then((ok) => {
          performInFlight = false;
          if (ok) {
            performDone = true;
            onceSet(performKey);
          }
        });
      }
      if (metaDone && gaDone && redditDone && performDone && timer) {
        window.clearInterval(timer);
      }
    };

    tick();
    timer = window.setInterval(() => {
      attempts += 1;
      tick();
      if (attempts >= MAX_ATTEMPTS) window.clearInterval(timer);
    }, RETRY_MS);

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [userId, email, adAttribution]);

  return null;
}
