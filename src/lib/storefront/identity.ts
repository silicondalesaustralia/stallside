import type { StorefrontIdentity } from "@/lib/storefront/types";

const STRING_KEYS = [
  "headline",
  "subheadline",
  "about",
  "heroImageUrl",
  "faviconUrl",
  "logoUrl",
  "contactEmail",
] as const;

export function parseStorefrontIdentity(raw: unknown): StorefrontIdentity | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const identity: StorefrontIdentity = {};
  for (const key of STRING_KEYS) {
    const value = obj[key];
    if (value === null || typeof value === "string") identity[key] = value;
  }
  if (typeof obj.showPhone === "boolean") identity.showPhone = obj.showPhone;
  return identity;
}

type IdentityColumns = {
  headline: string | null;
  subheadline: string | null;
  about: string | null;
  heroImageUrl: string | null;
  faviconUrl?: string | null;
  contactEmail: string | null;
  showPhone: boolean;
};

/**
 * Identity keys present in the config win over the Storefront columns.
 * Columns mirror the last published identity (see publishStorefront).
 */
export function overlayStorefrontIdentity<T extends IdentityColumns>(
  columns: T,
  identity: StorefrontIdentity | undefined,
): T {
  if (!identity) return columns;
  const pick = <V>(value: V | undefined, fallback: V): V =>
    value === undefined ? fallback : value;
  return {
    ...columns,
    headline: pick(identity.headline, columns.headline),
    subheadline: pick(identity.subheadline, columns.subheadline),
    about: pick(identity.about, columns.about),
    heroImageUrl: pick(identity.heroImageUrl, columns.heroImageUrl),
    faviconUrl: pick(identity.faviconUrl, columns.faviconUrl ?? null),
    contactEmail: pick(identity.contactEmail, columns.contactEmail),
    showPhone: pick(identity.showPhone, columns.showPhone),
  };
}

/** Column values to mirror on publish so non-website readers see live identity. */
export function identityColumnData(identity: StorefrontIdentity | undefined) {
  if (!identity) return {};
  const data: Partial<Omit<IdentityColumns, "faviconUrl"> & { faviconUrl: string | null }> = {};
  if (identity.headline !== undefined) data.headline = identity.headline;
  if (identity.subheadline !== undefined) data.subheadline = identity.subheadline;
  if (identity.about !== undefined) data.about = identity.about;
  if (identity.heroImageUrl !== undefined) data.heroImageUrl = identity.heroImageUrl;
  if (identity.faviconUrl !== undefined) data.faviconUrl = identity.faviconUrl;
  if (identity.contactEmail !== undefined) data.contactEmail = identity.contactEmail;
  if (identity.showPhone !== undefined) data.showPhone = identity.showPhone;
  return data;
}
