import type { TrackingConsentMode } from "./types";

export const CONSENT_COOKIE = "vendl_consent";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type ConsentChoice = "granted" | "denied";

/** EU + EEA + UK + Switzerland: visitors who get the banner in "eu" mode. */
const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO", "GB", "CH",
]);

export function isConsentCountry(countryCode: string | null | undefined): boolean {
  return Boolean(countryCode && CONSENT_COUNTRIES.has(countryCode.toUpperCase()));
}

export function consentRequired(mode: TrackingConsentMode, euVisitor: boolean): boolean {
  return mode === "all" || (mode === "eu" && euVisitor);
}

export function parseConsentChoice(value: string | null | undefined): ConsentChoice | null {
  return value === "granted" || value === "denied" ? value : null;
}

/** Whether tags (other than Google's consent-mode pings) may run for this visitor. */
export function trackingAllowed(
  mode: TrackingConsentMode,
  euVisitor: boolean,
  choice: ConsentChoice | null,
): boolean {
  return !consentRequired(mode, euVisitor) || choice === "granted";
}
