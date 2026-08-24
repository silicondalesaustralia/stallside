"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  appBaseUrl,
  getProPlanPriceId,
  getStripe,
  isStripeProBillingConfigured,
  parseBillingCurrencyParam,
} from "@/lib/stripe";
import { cardPlanCents } from "@/lib/saas-pricing";

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

/** Vendl Pro - billed from day one. */
export async function startProPlanCheckout(formData: FormData) {
  const { owner, user } = await requireOwnerWrite();
  if (!isStripeProBillingConfigured()) {
    throw new Error(
      "Stripe Pro Billing is not configured (need STRIPE_PRICE_ID_PRO_* or CARD_*).",
    );
  }

  const currency = parseBillingCurrencyParam(formData.get("currency"), "pro");
  const priceId = getProPlanPriceId(currency);
  const customerId = await ensureStripeCustomer(owner.id, user.email ?? null);
  const base = appBaseUrl();

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      billingCurrency: currency,
      monthlyFeeCents: cardPlanCents(currency),
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/dashboard/settings/billing?success=1`,
    cancel_url: `${base}/dashboard/settings/billing?cancelled=1`,
    allow_promotion_codes: true,
    metadata: {
      ownerId: owner.id,
      purpose: "saas_subscription",
      saasPlan: "pro",
      billingCurrency: currency,
    },
    subscription_data: {
      metadata: {
        ownerId: owner.id,
        purpose: "saas_subscription",
        saasPlan: "pro",
        billingCurrency: currency,
      },
    },
  });

  if (!session.url) {
    throw new Error("Could not start Pro plan checkout.");
  }
  redirect(session.url);
}

/** @deprecated Use startProPlanCheckout */
export async function startCardPlanCheckout(formData: FormData) {
  return startProPlanCheckout(formData);
}

/** Cash plan is no longer sold. */
export async function startCashPlanCheckout() {
  redirect("/dashboard/settings/billing");
}

export async function openBillingPortal() {
  const { owner } = await requireOwnerWrite();
  if (!owner.stripeCustomerId || !isStripeProBillingConfigured()) {
    redirect("/dashboard/settings/billing");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: owner.stripeCustomerId,
    return_url: `${appBaseUrl()}/dashboard/settings/billing`,
  });

  redirect(session.url);
}
