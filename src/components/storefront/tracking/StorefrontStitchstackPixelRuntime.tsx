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

/**
 * Consent-gated Stitchstack pixel. Always shows its own banner when consent is
 * required and undecided (do not suppress when Tags & Pixels are also present —
 * that previously left Analytics with no script and no way to grant consent).
 */
export default function StorefrontStitchstackPixelRuntime({
  scriptSrc,
  consentMode,
  euVisitor,
  privacyHref,
}: {
  scriptSrc: string;
  consentMode: TrackingConsentMode;
  euVisitor: boolean;
  privacyHref: string;
}) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const choice = useSyncExternalStore(subscribeConsentChoice, readConsentChoice, () => null);
  const [reopened, setReopened] = useState(false);
  const needsConsent = consentRequired(consentMode, euVisitor);
  const allowed = trackingAllowed(consentMode, euVisitor, choice);
  const bannerOpen = hydrated && (reopened || (needsConsent && choice === null));

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
