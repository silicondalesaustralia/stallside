import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { APP_NAME } from "@/lib/constants";

export async function clearOwnerStripeLink(ownerId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.owner.update({
      where: { id: ownerId },
      data: {
        stripeAccountId: null,
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      },
    });
    await tx.stand.updateMany({
      where: { ownerId },
      data: { acceptCard: false },
    });
    await tx.stand.updateMany({
      where: {
        ownerId,
        acceptCash: false,
        acceptLocalTransfer: false,
        acceptPayPal: false,
        acceptCard: false,
      },
      data: { acceptCash: true },
    });
  });
}

/** Drop an incomplete Connect account when country doesn't match billing region. */
export async function dropMismatchedConnectAccount(input: {
  ownerId: string;
  accountId: string;
  desiredCountry: string;
  chargesEnabled: boolean;
}): Promise<string | null> {
  if (input.chargesEnabled) return input.accountId;

  const stripe = getStripe();
  try {
    const account = await stripe.accounts.retrieve(input.accountId);
    const existing = (account.country ?? "").toUpperCase();
    if (!existing || existing === input.desiredCountry) {
      return input.accountId;
    }
    console.info(`[${APP_NAME}] recreating Connect account for country`, {
      ownerId: input.ownerId,
      from: existing,
      to: input.desiredCountry,
    });
    try {
      await stripe.accounts.del(input.accountId);
    } catch (error) {
      console.error("Stripe account delete before recreate failed", error);
    }
    await clearOwnerStripeLink(input.ownerId);
    return null;
  } catch (error) {
    console.error("Stripe account retrieve for country check failed", error);
    return input.accountId;
  }
}
