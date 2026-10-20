import { z } from "zod";

export const paymentsQuery = z.object({ standId: z.string().min(1) });

const providerStatus = z.enum(["connected", "finish_setup", "not_connected"]);
export type ProviderStatus = z.infer<typeof providerStatus>;

export const paymentChoices = z.object({
  acceptCash: z.boolean(),
  acceptLocalTransfer: z.boolean(),
  localTransferAlias: z.string().max(120),
  acceptCard: z.boolean(),
  acceptSquare: z.boolean(),
});
export type PaymentChoices = z.infer<typeof paymentChoices>;

export const paymentsResponse = z.object({
  currency: z.string(),
  choices: paymentChoices,
  /** PayID (or the local equivalent) for this currency; null when there isn't one. */
  localTransfer: z
    .object({ label: z.string(), placeholder: z.string(), hint: z.string() })
    .nullable(),
  cardReady: z.boolean(),
  stripe: providerStatus,
  /** Null outside Square's regions. */
  square: providerStatus.nullable(),
  squareReady: z.boolean(),
  squareIsProvider: z.boolean(),
});
export type PaymentsResponse = z.infer<typeof paymentsResponse>;

export const savePaymentsBody = z.object({
  standId: z.string().min(1),
  choices: paymentChoices,
});
