import { TRACKING_FIELD_BY_KEY } from "./fields";
import {
  DEFAULT_STOREFRONT_TRACKING,
  TRACKING_ID_KEYS,
  type StorefrontTracking,
  type TrackingConsentMode,
  type TrackingIds,
} from "./types";

export const TRACKING_CONFIG_KEY = "storefrontTracking";

const CONSENT_MODES: readonly TrackingConsentMode[] = ["off", "eu", "all"];

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

/** Re-validates stored ids so a hand-edited config can never inject script. */
function readIds(raw: unknown): TrackingIds {
  const obj = asRecord(raw);
  const ids: TrackingIds = {};
  for (const key of TRACKING_ID_KEYS) {
    const value = obj[key];
    const field = TRACKING_FIELD_BY_KEY.get(key);
    if (typeof value === "string" && field?.pattern.test(value)) ids[key] = value;
  }
  return ids;
}

export function extractStorefrontTracking(configRaw: unknown): StorefrontTracking {
  const obj = asRecord(asRecord(configRaw)[TRACKING_CONFIG_KEY]);
  const consentMode = CONSENT_MODES.find((m) => m === obj.consentMode) ?? DEFAULT_STOREFRONT_TRACKING.consentMode;
  return {
    ids: readIds(obj.ids),
    consentMode,
    privacyNotice: typeof obj.privacyNotice === "boolean" ? obj.privacyNotice : DEFAULT_STOREFRONT_TRACKING.privacyNotice,
    customHead: typeof obj.customHead === "string" ? obj.customHead : "",
    ...(typeof obj.updatedAt === "string" ? { updatedAt: obj.updatedAt } : {}),
  };
}

export function mergeStorefrontTrackingIntoRaw(
  configRaw: unknown,
  tracking: StorefrontTracking,
): Record<string, unknown> {
  return { ...asRecord(configRaw), [TRACKING_CONFIG_KEY]: tracking };
}

export function hasAnyTracking(tracking: StorefrontTracking): boolean {
  return Object.keys(tracking.ids).length > 0 || tracking.customHead.trim().length > 0;
}

/** Same ids, consent and custom code in both configs (ignores updatedAt). */
export function trackingMatches(a: StorefrontTracking, b: StorefrontTracking): boolean {
  const key = (t: StorefrontTracking) =>
    JSON.stringify([
      Object.entries(t.ids).sort(([x], [y]) => x.localeCompare(y)),
      t.consentMode,
      t.privacyNotice,
      t.customHead,
    ]);
  return key(a) === key(b);
}
