import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/** Persist Stripe Connect status. No revalidatePath — safe during RSC render. */
export async function syncStripeAccountStatus(input: {
  ownerId: string;
  stripeAccountId: string;
}): Promise<void> {
  if (!isStripeConfigured()) return;

  const account = await getStripe().accounts.retrieve(input.stripeAccountId);
  await prisma.owner.update({
    where: { id: input.ownerId },
    data: {
      stripeOnboardingComplete: account.details_submitted ?? false,
      stripeChargesEnabled: account.charges_enabled ?? false,
      stripePayoutsEnabled: account.payouts_enabled ?? false,
    },
  });
}
