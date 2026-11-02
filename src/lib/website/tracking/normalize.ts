import { TRACKING_FIELD_BY_KEY, type TrackingField } from "./fields";
import type { TrackingIdKey, TrackingIds } from "./types";

export type NormalizeResult = { value: string | null } | { error: string };

function applyCase(field: TrackingField, value: string): string {
  if (field.caseMode === "upper") return value.toUpperCase();
  if (field.caseMode === "lower") return value.toLowerCase();
  return value;
}

/** Accepts a bare id or a pasted snippet/meta tag and returns the cleaned id. Empty input clears it. */
export function normalizeTrackingId(key: TrackingIdKey, raw: string): NormalizeResult {
  const field = TRACKING_FIELD_BY_KEY.get(key);
  if (!field) return { error: "Unknown field." };
  const input = raw.trim();
  if (!input) return { value: null };
  if (key === "ga4Id" && /^UA-\d+/i.test(input)) {
    return { error: "That's a Universal Analytics ID (UA-…), which Google has shut down. Use your GA4 Measurement ID (G-…)." };
  }
  const direct = applyCase(field, input);
  if (field.pattern.test(direct)) return { value: direct };
  for (const extractor of field.extractors) {
    const hit = input.match(extractor)?.[1];
    if (!hit) continue;
    const value = applyCase(field, hit);
    if (field.pattern.test(value)) return { value };
  }
  return { error: `That doesn't look like a ${field.label} ID (expected something like ${field.placeholder}).` };
}

export type NormalizedIds = { ids: TrackingIds; errors: Partial<Record<TrackingIdKey, string>> };

/** Normalises every submitted id. A pasted "AW-123/label" also fills the purchase label. */
export function normalizeTrackingIds(input: Partial<Record<TrackingIdKey, string>>): NormalizedIds {
  const ids: TrackingIds = {};
  const errors: Partial<Record<TrackingIdKey, string>> = {};
  for (const key of Object.keys(input) as TrackingIdKey[]) {
    const result = normalizeTrackingId(key, input[key] ?? "");
    if ("error" in result) errors[key] = result.error;
    else if (result.value) ids[key] = result.value;
  }
  const pastedLabel = input.googleAdsId?.match(/AW-\d{8,12}\/([A-Za-z0-9_-]{6,40})/i)?.[1];
  if (!ids.googleAdsPurchaseLabel && !errors.googleAdsPurchaseLabel && pastedLabel) {
    ids.googleAdsPurchaseLabel = pastedLabel;
  }
  return { ids, errors };
}
