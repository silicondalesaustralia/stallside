"use server";

import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  appBaseUrl,
  getCashPlanPriceId,
  getStripe,
  isStripeBillingConfigured,
} from "@/lib/stripe";

async function ensureStripeCustomer(ownerId: string, email: string | null) {
  const owner = await prisma.owner.findUniqueOrThrow({ where: { id: ownerId } });
  if (owner.stripeCustomerId) {
    return owner.stripeCustomerId;
  }

  const customer = await getStripe().customers.create({
    email: email || owner.contactEmail || undefined,
    name: owner.businessName,
    metadata: { ownerId: owner.id },
  });

  await prisma.owner.update({
    where: { id: owner.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function startCashPlanCheckout() {
  const { owner, user } = await requireOwner();
  if (!isStripeBillingConfigured()) {
    throw new Error("Stripe Billing is not configured (need STRIPE_PRICE_ID_CASH).");
  }

  const customerId = await ensureStripeCustomer(owner.id, user.email ?? null);
  const base = appBaseUrl();
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: getCashPlanPriceId(), quantity: 1 }],
    success_url: `${base}/dashboard/settings/billing?success=1`,
    cancel_url: `${base}/dashboard/settings/billing?cancelled=1`,
    allow_promotion_codes: true,
    metadata: { ownerId: owner.id, purpose: "saas_subscription" },
    subscription_data: {
      metadata: { ownerId: owner.id, purpose: "saas_subscription" },
    },
  });

  if (!session.url) {
    throw new Error("Could not start Stripe subscription checkout.");
  }
  redirect(session.url);
}

export async function openBillingPortal() {
  const { owner } = await requireOwner();
  if (!owner.stripeCustomerId || !isStripeBillingConfigured()) {
    redirect("/dashboard/settings/billing");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: owner.stripeCustomerId,
    return_url: `${appBaseUrl()}/dashboard/settings/billing`,
  });

  redirect(session.url);
}
