import { z } from "zod";

export const mobileReferral = z.object({
  id: z.string(),
  businessName: z.string(),
  /** YYYY-MM-DD. */
  joinedOn: z.string(),
  status: z.enum(["Pro", "Free for Life", "Cancelled", "Free"]),
  /** e.g. "A$40.00 · US$12.50". */
  earnedLabel: z.string(),
});
export type MobileReferral = z.infer<typeof mobileReferral>;

/** Money totals are pre-formatted because referrals can pay in several currencies. */
export const referralStats = z.object({
  clicks: z.number().int(),
  signups: z.number().int(),
  livePro: z.number().int(),
  monthlyCommission: z.string(),
  owed: z.string(),
  paid: z.string(),
  /** Null when nothing was missed. */
  missed: z.string().nullable(),
});

export const referralsResponse = z.object({
  eligible: z.boolean(),
  hadLink: z.boolean(),
  url: z.string().nullable(),
  stats: referralStats.nullable(),
  referrals: z.array(mobileReferral),
});
export type ReferralsResponse = z.infer<typeof referralsResponse>;
