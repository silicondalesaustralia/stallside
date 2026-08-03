import { stallsideFeeCents } from "@/lib/money";
import { ownerHasProAccess, type ComplimentaryAccessInput } from "@/lib/owner-trial";

type FeeOwner = {
  subscriptionPlan?: string | null;
  lifetimeAccess?: boolean | null;
  subscriptionStatus?: string | null;
  trialEndsAt?: Date | null;
  currentPeriodEndsAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
  passFeeToCustomer?: boolean | null;
};

/** Free plan Stripe sales take the Stallside fee; Pro / trial / lifetime do not. */
export function shouldChargeStallsideFee(
  owner: FeeOwner,
  access?: ComplimentaryAccessInput,
): boolean {
  return !ownerHasProAccess(owner, access);
}

export function computeStallsideApplicationFee(
  itemTotalCents: number,
  owner: FeeOwner,
  access?: ComplimentaryAccessInput,
): number {
  if (!shouldChargeStallsideFee(owner, access)) return 0;
  return stallsideFeeCents(itemTotalCents);
}

export function ownerPassesFeeToCustomer(owner: FeeOwner): boolean {
  return Boolean(owner.passFeeToCustomer);
}
