"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  injectCustomScript,
  readConsentChoice,
  subscribeConsentChoice,
  writeConsentChoice,
} from "@/lib/website/tracking/browser";
import {
  consentRequired,
  trackingAllowed,
  type ConsentChoice,
} from "@/lib/website/tracking/consent";
import type { TrackingConsentMode } from "@/lib/website/tracking/types";
import ConsentBanner from "./ConsentBanner";

const SCRIPT_ID = "vendl-stitchstack-pixel";
const noopSubscribe = () => () => {};

/** Consent-aware Stitchstack first-party analytics script. */
export default function StorefrontStitchstackPixelRuntime({
  scriptSrc,
  consentMode,
  euVisitor,
  showBanner,
  privacyHref,
}: {
  scriptSrc: string;
  consentMode: TrackingConsentMode;
  euVisitor: boolean;
  showBanner: boolean;
  privacyHref: string;
}) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const choice = useSyncExternalStore(subscribeConsentChoice, readConsentChoice, () => null);
  const [reopened, setReopened] = useState(false);
  const needsConsent = consentRequired(consentMode, euVisitor);
  const allowed = trackingAllowed(consentMode, euVisitor, choice);
  const bannerOpen = showBanner && hydrated && (reopened || (needsConsent && choice === null));

  useEffect(() => {
    if (!allowed) return;
    injectCustomScript({ src: scriptSrc, async: true }, SCRIPT_ID);
  }, [allowed, scriptSrc]);

  const decide = useCallback((next: ConsentChoice) => {
    writeConsentChoice(next);
    setReopened(false);
  }, []);

  if (!bannerOpen) return null;
  return (
    <ConsentBanner
      privacyHref={privacyHref}
      current={choice}
      onDecide={decide}
      onClose={() => setReopened(false)}
    />
  );
}
