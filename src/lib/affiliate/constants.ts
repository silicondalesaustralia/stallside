export const REF_COOKIE = "vendl_ref";
export const REF_MAX_AGE_SEC = 60 * 60 * 24 * 90;

/** Affiliates earn 50% of each referred Pro invoice (ex tax), for life. */
export const AFFILIATE_COMMISSION_BPS = 5000;

export function commissionFromCents(amountCents: number): number {
  if (amountCents <= 0) return 0;
  return Math.round((amountCents * AFFILIATE_COMMISSION_BPS) / 10_000);
}

const CODE_RE = /^[a-z0-9-]{3,40}$/;

export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toLowerCase();
  return CODE_RE.test(code) ? code : null;
}
