import { APP_DOMAIN } from "@/lib/constants";
import { isReservedVendlSubdomain } from "@/lib/tenancy/reserved-subdomains";

export type HostResolution =
  | { type: "APP" }
  | { type: "VENDL_SUBDOMAIN"; slug: string }
  | { type: "CUSTOM_DOMAIN"; hostname: string }
  | { type: "LOCAL" }
  | { type: "LOCAL_SUBDOMAIN"; slug: string }
  | { type: "VERCEL_PREVIEW" }
  | { type: "UNKNOWN" };

/** Strip port and lowercase. Safe for Host / x-forwarded-host. */
export function normalizeHostname(raw: string | null | undefined): string {
  if (!raw) return "";
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.split(":")[0]?.toLowerCase() ?? "";
}

export function resolveHostname(
  hostHeader: string | null | undefined,
  apexDomain: string = APP_DOMAIN,
): HostResolution {
  const host = normalizeHostname(hostHeader);
  if (!host) return { type: "UNKNOWN" };

  if (host === "localhost" || host === "127.0.0.1") {
    return { type: "LOCAL" };
  }

  if (host.endsWith(".localhost")) {
    const label = host.slice(0, -".localhost".length);
    if (!label || label.includes(".") || isReservedVendlSubdomain(label)) {
      return { type: "UNKNOWN" };
    }
    return { type: "LOCAL_SUBDOMAIN", slug: label };
  }

  if (host.endsWith(".vercel.app")) {
    return { type: "VERCEL_PREVIEW" };
  }

  const apex = apexDomain.toLowerCase();
  if (host === apex || host === `www.${apex}`) {
    return { type: "APP" };
  }

  if (host.endsWith(`.${apex}`)) {
    const label = host.slice(0, -(apex.length + 1));
    if (!label || label.includes(".")) {
      return { type: "UNKNOWN" };
    }
    if (isReservedVendlSubdomain(label)) {
      return { type: "APP" };
    }
    return { type: "VENDL_SUBDOMAIN", slug: label };
  }

  // Phase 9: verified custom hostnames resolved via DB (middleware lookup).
  if (host.includes(".")) {
    return { type: "CUSTOM_DOMAIN", hostname: host };
  }

  return { type: "UNKNOWN" };
}

export function isSellerStorefrontHost(resolution: HostResolution): boolean {
  return (
    resolution.type === "VENDL_SUBDOMAIN" ||
    resolution.type === "LOCAL_SUBDOMAIN" ||
    resolution.type === "CUSTOM_DOMAIN"
  );
}
