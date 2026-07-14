"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeBillingConfigured } from "@/lib/stripe";
import { syncOwnerFromSubscription } from "@/lib/stripe-billing";

async function loadOwner(ownerId: string) {
  await requireAdmin();
  const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
  if (!owner) throw new Error("Owner not found");
  if (!isStripeBillingConfigured()) {
    throw new Error("Stripe Billing is not configured");
  }
  return owner;
}

export async function refundLatestSubscriptionInvoice(ownerId: string) {
  const owner = await loadOwner(ownerId);
  if (!owner.stripeCustomerId) {
    throw new Error("Owner has no Stripe customer");
  }

  const stripe = getStripe();
  const invoices = await stripe.invoices.list({
    customer: owner.stripeCustomerId,
    status: "paid",
    limit: 1,
  });
  const invoice = invoices.data[0];
  if (!invoice) throw new Error("No paid invoice to refund");

  const payments = await stripe.invoicePayments.list({
    invoice: invoice.id,
    status: "paid",
    limit: 5,
  });
  const paymentIntent = payments.data
    .map((p) => p.payment.payment_intent)
    .map((pi) => (typeof pi === "string" ? pi : pi?.id))
    .find(Boolean);

  if (!paymentIntent) {
    throw new Error("Invoice has no payment intent to refund");
  }

  await stripe.refunds.create({ payment_intent: paymentIntent });
  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      lifetimePaidCents: Math.max(
        0,
        owner.lifetimePaidCents - (invoice.amount_paid ?? 0),
      ),
    },
  });

  revalidatePath(`/admin/owners/${ownerId}`);
  revalidatePath("/admin/owners");
  revalidatePath("/admin");
}

export async function applyCouponToOwner(formData: FormData) {
  const ownerId = String(formData.get("ownerId") ?? "");
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  if (!ownerId || !code) throw new Error("Owner and coupon code required");

  const owner = await loadOwner(ownerId);
  if (!owner.stripeSubscriptionId) {
    throw new Error("Owner has no active Stripe subscription");
  }

  const stripe = getStripe();
  const promos = await stripe.promotionCodes.list({
    code,
    limit: 1,
    active: true,
  });
  const promo = promos.data[0];
  if (!promo) throw new Error(`No active promotion code: ${code}`);

  const subscription = await stripe.subscriptions.update(
    owner.stripeSubscriptionId,
    { discounts: [{ promotion_code: promo.id }] },
  );
  await syncOwnerFromSubscription(subscription);

  revalidatePath(`/admin/owners/${ownerId}`);
}

export async function cancelOwnerSubscription(ownerId: string) {
  const owner = await loadOwner(ownerId);
  if (!owner.stripeSubscriptionId) {
    throw new Error("Owner has no Stripe subscription");
  }

  const subscription = await getStripe().subscriptions.update(
    owner.stripeSubscriptionId,
    { cancel_at_period_end: true },
  );
  await syncOwnerFromSubscription(subscription);

  revalidatePath(`/admin/owners/${ownerId}`);
  revalidatePath("/admin/owners");
  revalidatePath("/admin");
}
