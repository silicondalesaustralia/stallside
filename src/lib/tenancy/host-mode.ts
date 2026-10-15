import { APP_DOMAIN } from "@/lib/constants";

/** Public host mode for URL generation (staging vs production apex). */
export type PublicHostMode = "production" | "staging";

/**
 * This staging environment's app host: `VENDL_STAGING_HOST` (e.g. stagingv2.vendl.app),
 * else staging.vendl.app. Only a host directly under the apex is accepted.
 */
export function stagingRootHost(apexDomain: string = APP_DOMAIN): string {
  const apex = apexDomain.toLowerCase();
  const configured = process.env.VENDL_STAGING_HOST?.trim().toLowerCase();
  if (configured && configured.endsWith(`.${apex}`) && !configured.slice(0, -(apex.length + 1)).includes(".")) {
    return configured;
  }
  return `staging.${apex}`;
}

export function publicHostMode(): PublicHostMode {
  if (process.env.VENDL_HOST_ENV === "staging") return "staging";
  if (process.env.VENDL_HOST_ENV === "production") return "production";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").toLowerCase();
  if (appUrl.includes(stagingRootHost())) return "staging";
  return "production";
}

/** Apex host for this environment: vendl.app or the staging host. */
export function publicApexHost(): string {
  return publicHostMode() === "staging" ? stagingRootHost() : APP_DOMAIN;
}
