import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { extractStorefrontTracking, hasAnyTracking } from "../config";
import { CONSENT_COOKIE, isConsentCountry, parseConsentChoice, trackingAllowed } from "../consent";
import { ownerCanUseTagsPixels } from "../entitlements";

/** Stored on Order.trackingAttribution; only orders placed on the seller's own host get one. */
export type TrackingAttribution = {
  v: 1;
  consent: "allowed" | "denied";
  pageUrl?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  ttp?: string;
  ttclid?: string;
  gaClientId?: string;
};

const str = (value: unknown, max = 500): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;

function readAdAttrCookie(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** "GA1.1.123456789.1700000000" → "123456789.1700000000" */
export function gaClientIdFromCookie(value: string | undefined): string | undefined {
  const match = value?.match(/^GA\d\.\d\.(\d+\.\d+)$/);
  return match?.[1];
}

/**
 * Snapshot of ad cookies and request details for server-side conversions. Returns
 * undefined off the seller's host or when the site has no tags, so nothing is stored.
 */
export async function captureTrackingAttribution(ownerId: string): Promise<TrackingAttribution | undefined> {
  try {
    const h = await headers();
    if (!h.get("x-vendl-tenant-slug")) return undefined;
    const storefront = await prisma.storefront.findUnique({
      where: { ownerId },
      select: { isPublished: true, publishedConfig: true },
    });
    if (!storefront?.isPublished) return undefined;
    const tracking = extractStorefrontTracking(storefront.publishedConfig);
    if (!hasAnyTracking(tracking)) return undefined;
    if (!(await ownerCanUseTagsPixels(ownerId))) return undefined;

    const jar = await cookies();
    const choice = parseConsentChoice(jar.get(CONSENT_COOKIE)?.value);
    const allowed = trackingAllowed(tracking.consentMode, isConsentCountry(h.get("x-vercel-ip-country")), choice);
    if (!allowed) return { v: 1, consent: "denied" };

    const attr = readAdAttrCookie(jar.get("ss_ad_attr")?.value);
    return {
      v: 1,
      consent: "allowed",
      pageUrl: str(h.get("referer")),
      ip: str(h.get("x-forwarded-for")?.split(",")[0], 64),
      userAgent: str(h.get("user-agent")),
      fbp: str(jar.get("_fbp")?.value, 200),
      fbc: str(jar.get("_fbc")?.value, 300) ?? str(attr.fbc, 300),
      ttp: str(jar.get("_ttp")?.value, 200),
      ttclid: str(attr.ttclid, 300),
      gaClientId: gaClientIdFromCookie(jar.get("_ga")?.value),
    };
  } catch (error) {
    console.error("Tracking attribution capture failed", error);
    return undefined;
  }
}

export function parseTrackingAttribution(raw: unknown): TrackingAttribution | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.v !== 1 || (obj.consent !== "allowed" && obj.consent !== "denied")) return null;
  return {
    v: 1,
    consent: obj.consent,
    pageUrl: str(obj.pageUrl),
    ip: str(obj.ip, 64),
    userAgent: str(obj.userAgent),
    fbp: str(obj.fbp, 200),
    fbc: str(obj.fbc, 300),
    ttp: str(obj.ttp, 200),
    ttclid: str(obj.ttclid, 300),
    gaClientId: str(obj.gaClientId, 100),
  };
}
