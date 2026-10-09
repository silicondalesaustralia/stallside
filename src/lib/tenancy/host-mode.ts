import { APP_DOMAIN } from "@/lib/constants";

/** Public host mode for URL generation (staging vs production apex). */
export type PublicHostMode = "production" | "staging";

export function publicHostMode(): PublicHostMode {
  if (process.env.VENDL_HOST_ENV === "staging") return "staging";
  if (process.env.VENDL_HOST_ENV === "production") return "production";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").toLowerCase();
  if (appUrl.includes(`staging.${APP_DOMAIN}`)) return "staging";
  return "production";
}

/** Apex host for this environment: vendl.app or staging.vendl.app */
export function publicApexHost(): string {
  return publicHostMode() === "staging"
    ? `staging.${APP_DOMAIN}`
    : APP_DOMAIN;
}
