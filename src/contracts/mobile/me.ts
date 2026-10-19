import { z } from "zod";

export const mobileFeature = z.object({
  id: z.string(),
  label: z.string(),
  group: z.string().nullable(),
  webPath: z.string(),
  native: z.boolean(),
  comingSoon: z.boolean(),
});
export type MobileFeature = z.infer<typeof mobileFeature>;

export const mobileBusiness = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  timezone: z.string(),
});
export type MobileBusiness = z.infer<typeof mobileBusiness>;

export const meResponse = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
  owner: z.object({
    id: z.string(),
    businessName: z.string(),
    plan: z.string().nullable(),
    proAccess: z.boolean(),
    onboardingComplete: z.boolean(),
  }),
  businesses: z.array(mobileBusiness),
  features: z.array(mobileFeature),
  minAppVersion: z.string(),
});
export type MeResponse = z.infer<typeof meResponse>;
