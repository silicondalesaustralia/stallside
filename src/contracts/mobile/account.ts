import { z } from "zod";

export const accountResponse = z.object({
  email: z.string(),
  businessName: z.string(),
  /** e.g. "Pro · renews 3 Nov 2026". */
  subscription: z.string(),
  billingRegion: z.string(),
});
export type AccountResponse = z.infer<typeof accountResponse>;

export const updateAccountBody = z.object({ businessName: z.string().max(200) });
