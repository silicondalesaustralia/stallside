import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/** Persist Stripe Connect status. No revalidatePath - safe during RSC render. */
export async function syncStripeAccountStatus(input: {
  ownerId: string;
  stripeAccountId: string;
}): Promise<void> {
  if (!isStripeConfigured()) return;

  const account = await getStripe().accounts.retrieve(input.stripeAccountId);
  const owner = await prisma.owner.findUnique({
    where: { id: input.ownerId },
    select: { stripeConnectStartedAt: true },
  });
  const connectStartedAt =
    owner?.stripeConnectStartedAt ??
    (account.created ? new Date(account.created * 1000) : new Date());

  await prisma.owner.update({
    where: { id: input.ownerId },
    data: {
      stripeOnboardingComplete: account.details_submitted ?? false,
      stripeChargesEnabled: account.charges_enabled ?? false,
      stripePayoutsEnabled: account.payouts_enabled ?? false,
      stripeConnectStartedAt: connectStartedAt,
    },
  });
}
