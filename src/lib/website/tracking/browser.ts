import { CONSENT_COOKIE, CONSENT_MAX_AGE_SECONDS, parseConsentChoice, type ConsentChoice } from "./consent";
import type { CustomHeadScript } from "./types";

export const CONSENT_OPEN_EVENT = "vendl:consent-open";
const CONSENT_CHANGE_EVENT = "vendl:consent-change";

/** useSyncExternalStore subscription for the consent cookie. */
export function subscribeConsentChoice(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

export function injectInlineScript(code: string, id: string) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  el.text = code;
  document.head.appendChild(el);
}

export function injectCustomScript(script: CustomHeadScript, id: string) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  if (script.src) {
    el.src = script.src;
    el.async = script.async;
  } else if (script.inline) {
    el.text = script.inline;
  }
  document.head.appendChild(el);
}

export function readConsentChoice(): ConsentChoice | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return parseConsentChoice(match?.[1]);
}

export function writeConsentChoice(choice: ConsentChoice) {
  const secure = location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice};path=/;max-age=${CONSENT_MAX_AGE_SECONDS};SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

/** True the first time an id is seen on this browser (purchase de-duplication across reloads). */
export function firstTimeSeen(key: string): boolean {
  try {
    const storageKey = `vendl_tracked_${key}`;
    if (localStorage.getItem(storageKey)) return false;
    localStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
