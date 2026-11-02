"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_OPEN_EVENT,
  firstTimeSeen,
  injectCustomScript,
  injectInlineScript,
  readConsentChoice,
  subscribeConsentChoice,
  writeConsentChoice,
} from "@/lib/website/tracking/browser";
import { consentRequired, trackingAllowed, type ConsentChoice } from "@/lib/website/tracking/consent";
import { dispatchPageView, dispatchStorefrontEvent } from "@/lib/website/tracking/dispatch";
import {
  purchaseEventId,
  releaseStorefrontEvents,
  STOREFRONT_EVENT,
  takeQueuedStorefrontEvents,
  type StorefrontEvent,
} from "@/lib/website/tracking/events";
import { googleBootstrapSnippet, googleConsentUpdateSnippet, hasGoogleTags } from "@/lib/website/tracking/snippets-google";
import { pixelSnippets } from "@/lib/website/tracking/snippets-pixels";
import type { PublicTagsConfig } from "@/lib/website/tracking/types";
import { pushTagsLog } from "@/lib/website/tracking/debug-log";

const noopSubscribe = () => () => {};
const noopNote = () => {};

export function useStorefrontTags(config: PublicTagsConfig) {
  const { ids, consentMode, euVisitor, customScripts, debug } = config;
  const needsConsent = consentRequired(consentMode, euVisitor);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const choice = useSyncExternalStore(subscribeConsentChoice, readConsentChoice, () => null);
  const [reopened, setReopened] = useState(false);
  const bannerOpen = hydrated && (reopened || (needsConsent && choice === null));
  const allowedRef = useRef(false);
  const pathname = usePathname();
  const firstPath = useRef(true);
  const note = debug ? pushTagsLog : noopNote;

  const loadPixels = useCallback(() => {
    if (allowedRef.current) return;
    allowedRef.current = true;
    for (const { key, code } of pixelSnippets(ids)) injectInlineScript(code, `vendl-tag-${key}`);
    customScripts.forEach((script, i) => injectCustomScript(script, `vendl-custom-${i}`));
    note("tags", "Pixels and custom code loaded");
  }, [ids, customScripts, note]);

  const handle = useCallback((event: StorefrontEvent) => {
    if (event.name === "purchase" && !firstTimeSeen(purchaseEventId(event.orderNumber))) {
      note("purchase", `Skipped repeat of order ${event.orderNumber}`);
      return;
    }
    dispatchStorefrontEvent(ids, event, allowedRef.current);
    note(event.name, `${event.items.length} item(s), ${(event.valueCents / 100).toFixed(2)} ${event.currency}`);
  }, [ids, note]);

  useEffect(() => {
    const stored = readConsentChoice();
    const granted = trackingAllowed(consentMode, euVisitor, stored);
    if (hasGoogleTags(ids)) {
      injectInlineScript(googleBootstrapSnippet(ids, needsConsent, granted), "vendl-tag-google");
      note("google", needsConsent ? `Consent Mode default: ${granted ? "granted" : "denied"}` : "Loaded");
    }
    if (granted) loadPixels();
    const onEvent = (e: Event) => {
      if (e instanceof CustomEvent) handle(e.detail as StorefrontEvent);
    };
    const onOpen = () => setReopened(true);
    window.addEventListener(STOREFRONT_EVENT, onEvent);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    takeQueuedStorefrontEvents().forEach(handle);
    return () => {
      window.removeEventListener(STOREFRONT_EVENT, onEvent);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
      releaseStorefrontEvents();
    };
  }, [ids, consentMode, euVisitor, needsConsent, loadPixels, handle, note]);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (allowedRef.current) dispatchPageView(ids);
  }, [pathname, ids]);

  const decide = useCallback((next: ConsentChoice) => {
    writeConsentChoice(next);
    setReopened(false);
    if (hasGoogleTags(ids)) injectInlineScript(googleConsentUpdateSnippet(next === "granted"), `vendl-consent-${Date.now()}`);
    if (next === "granted") loadPixels();
    note("consent", next);
  }, [ids, loadPixels, note]);

  return { needsConsent, choice, bannerOpen, decide, closeBanner: () => setReopened(false) };
}
