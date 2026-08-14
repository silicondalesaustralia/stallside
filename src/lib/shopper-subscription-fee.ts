import { randomBytes } from "crypto";
import { STALLSIDE_FEE_BPS } from "@/lib/constants";
import { shouldChargeVendlFee } from "@/lib/stallside-fee";

export function newManageToken(): string {
  return randomBytes(24).toString("hex");
}

type FeeOwner = Parameters<typeof shouldChargeVendlFee>[0];

/** Connect application_fee_percent for shopper subscriptions (absorb-style). */
export function shopperSubApplicationFeePercent(
  owner: FeeOwner,
): number | undefined {
  if (!shouldChargeVendlFee(owner)) return undefined;
  return STALLSIDE_FEE_BPS / 100;
}
