"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";

export async function startStripeConnect() {
  const { owner, user } = await requireOwner();
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured on the server yet.");
  }

  const stripe = getStripe();
  let accountId = owner.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: owner.contactEmail || user.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: owner.businessName,
        product_description: "Farm stand / roadside produce sales",
      },
      metadata: { ownerId: owner.id },
    });
    accountId = account.id;
    await prisma.owner.update({
      where: { id: owner.id },
      data: { stripeAccountId: accountId },
    });
  }

  const base = appBaseUrl();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${base}/dashboard/settings/stripe?refresh=1`,
    return_url: `${base}/dashboard/settings/stripe?return=1`,
    type: "account_onboarding",
  });

  redirect(link.url);
}

export async function refreshStripeStatus() {
  const { owner } = await requireOwner();
  if (!owner.stripeAccountId || !isStripeConfigured()) {
    redirect("/dashboard/settings/stripe");
  }

  await syncStripeAccountStatus({
    ownerId: owner.id,
    stripeAccountId: owner.stripeAccountId,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/stripe");
  redirect("/dashboard/settings/stripe");
}
