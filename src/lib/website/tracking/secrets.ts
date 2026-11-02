import { decryptSecret, encryptSecret } from "@/lib/square/crypto";

/** Server-side conversion credentials; encrypted at rest in Storefront.trackingSecrets. */
export const TRACKING_SECRET_KEYS = ["metaCapiToken", "tiktokAccessToken", "ga4ApiSecret"] as const;
export type TrackingSecretKey = (typeof TRACKING_SECRET_KEYS)[number];

/** Test codes aren't secret; stored in the clear next to the tokens. */
export const TRACKING_TEST_CODE_KEYS = ["metaTestEventCode", "tiktokTestEventCode"] as const;
export type TrackingTestCodeKey = (typeof TRACKING_TEST_CODE_KEYS)[number];

export type TrackingSecrets = Partial<Record<TrackingSecretKey | TrackingTestCodeKey, string>>;

export type TrackingSecretsStatus = {
  saved: Record<TrackingSecretKey, boolean>;
  testCodes: Partial<Record<TrackingTestCodeKey, string>>;
};

const SECRET_PATTERNS: Record<TrackingSecretKey, RegExp> = {
  metaCapiToken: /^[A-Za-z0-9_-]{40,600}$/,
  tiktokAccessToken: /^[A-Za-z0-9_-]{20,200}$/,
  ga4ApiSecret: /^[A-Za-z0-9_-]{10,100}$/,
};

const TEST_CODE_PATTERNS: Record<TrackingTestCodeKey, RegExp> = {
  metaTestEventCode: /^TEST\d{3,10}$/,
  tiktokTestEventCode: /^TEST\d{3,10}$/,
};

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

export function validSecret(key: TrackingSecretKey, value: string): boolean {
  return SECRET_PATTERNS[key].test(value);
}

export function validTestCode(key: TrackingTestCodeKey, value: string): boolean {
  return TEST_CODE_PATTERNS[key].test(value);
}

/** Decrypted secrets; a value that fails to decrypt (rotated AUTH_SECRET) is treated as missing. */
export function readTrackingSecrets(raw: unknown): TrackingSecrets {
  const obj = asRecord(raw);
  const out: TrackingSecrets = {};
  for (const key of TRACKING_SECRET_KEYS) {
    const enc = obj[key];
    if (typeof enc !== "string") continue;
    try {
      out[key] = decryptSecret(enc);
    } catch (error) {
      console.error(`Could not decrypt tracking secret ${key}`, error);
    }
  }
  for (const key of TRACKING_TEST_CODE_KEYS) {
    const code = obj[key];
    if (typeof code === "string" && validTestCode(key, code)) out[key] = code;
  }
  return out;
}

export function trackingSecretsStatus(raw: unknown): TrackingSecretsStatus {
  const obj = asRecord(raw);
  const saved = Object.fromEntries(TRACKING_SECRET_KEYS.map((k) => [k, typeof obj[k] === "string"])) as Record<TrackingSecretKey, boolean>;
  const testCodes: TrackingSecretsStatus["testCodes"] = {};
  for (const key of TRACKING_TEST_CODE_KEYS) {
    const code = obj[key];
    if (typeof code === "string") testCodes[key] = code;
  }
  return { saved, testCodes };
}

export type SecretsUpdate = {
  set: Partial<Record<TrackingSecretKey, string>>;
  clear: TrackingSecretKey[];
  testCodes: Partial<Record<TrackingTestCodeKey, string | null>>;
};

/** Applies an update to the stored JSON: encrypts new values, keeps untouched ones. */
export function applySecretsUpdate(raw: unknown, update: SecretsUpdate): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(asRecord(raw))) {
    if (typeof value === "string") next[key] = value;
  }
  for (const key of update.clear) delete next[key];
  for (const [key, value] of Object.entries(update.set)) {
    if (value) next[key] = encryptSecret(value);
  }
  for (const [key, value] of Object.entries(update.testCodes)) {
    if (value) next[key] = value;
    else delete next[key];
  }
  return next;
}
