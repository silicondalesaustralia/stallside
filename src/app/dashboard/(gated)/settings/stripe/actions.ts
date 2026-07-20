"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";

export async function startStripeConnect() {
  const { owner, user } = await requireOwner();
  if (
    !ownerHasCardTierAccess(owner, { email: user.email, role: user.role })
  ) {
    throw new Error("Stripe Connect requires the Card plan.");
  }
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

/** Unlink Stripe Connect from this owner so card checkout stops. */
export async function disconnectStripe() {
  const { owner } = await requireOwner();
  if (!owner.stripeAccountId) {
    redirect("/dashboard/settings/stripe");
  }

  const accountId = owner.stripeAccountId;

  await prisma.$transaction(async (tx) => {
    await tx.owner.update({
      where: { id: owner.id },
      data: {
        stripeAccountId: null,
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      },
    });
    await tx.stand.updateMany({
      where: { ownerId: owner.id },
      data: { acceptCard: false },
    });
    await tx.stand.updateMany({
      where: {
        ownerId: owner.id,
        acceptCash: false,
        acceptLocalTransfer: false,
        acceptPayPal: false,
        acceptCard: false,
      },
      data: { acceptCash: true },
    });
  });

  if (isStripeConfigured()) {
    try {
      await getStripe().accounts.del(accountId);
    } catch (error) {
      // Balance or Stripe-side lock — Stallside is already unlinked.
      console.error("Stripe connected-account delete after disconnect failed", error);
    }
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/stands");
  redirect("/dashboard/settings/stripe?disconnected=1");
}
