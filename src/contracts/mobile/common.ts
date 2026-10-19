import { z } from "zod";

export const MOBILE_API_BASE = "/api/mobile/v1";
export const MOBILE_MIN_APP_VERSION_HEADER = "x-vendl-min-app-version";

export const MOBILE_PLATFORMS = ["ios", "android"] as const;
export const mobilePlatform = z.enum(MOBILE_PLATFORMS);
export type MobilePlatform = z.infer<typeof mobilePlatform>;

export const mobileApiError = z.object({ error: z.string() });
export type MobileApiError = z.infer<typeof mobileApiError>;

export const mobileOk = z.object({ ok: z.literal(true) });
export type MobileOk = z.infer<typeof mobileOk>;
