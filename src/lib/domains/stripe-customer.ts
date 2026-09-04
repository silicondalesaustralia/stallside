/** Ensure owner has a Stripe customer that matches the current API key mode. */

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function ensureStripeCustomerForOwner(input: {
  ownerId: string;
  existingCustomerId: string | null;
  email: string | undefined;
  name: string;
}): Promise<string> {
  const stripe = getStripe();
  if (input.existingCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(input.existingCustomerId);
      if (!("deleted" in existing && existing.deleted)) {
        return existing.id;
      }
    } catch {
      /* wrong mode or deleted — create fresh below */
    }
  }
  const customer = await stripe.customers.create({
    email: input.email,
    name: input.name,
    metadata: { ownerId: input.ownerId },
  });
  await prisma.owner.update({
    where: { id: input.ownerId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
