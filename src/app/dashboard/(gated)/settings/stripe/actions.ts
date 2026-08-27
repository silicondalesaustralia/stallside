"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import {
  stripeConnectCountry,
  stripeConnectDefaultCurrency,
} from "@/lib/stripe-connect-country";
import {
  clearOwnerStripeLink,
  dropMismatchedConnectAccount,
} from "@/lib/stripe-connect-account";
import { connectCapabilitiesForCountry } from "@/lib/stripe-connect-capabilities";

export async function startStripeConnect() {
  const { owner, user } = await requireOwnerWrite();
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured on the server yet.");
  }

  const stripe = getStripe();
  const country = stripeConnectCountry(owner.billingCurrency);
  const defaultCurrency = stripeConnectDefaultCurrency(owner.billingCurrency);
  let accountId = owner.stripeAccountId;

  if (accountId) {
    accountId = await dropMismatchedConnectAccount({
      ownerId: owner.id,
      accountId,
      desiredCountry: country,
      chargesEnabled: owner.stripeChargesEnabled,
    });
  }

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country,
      default_currency: defaultCurrency,
      email: owner.contactEmail || user.email || undefined,
      capabilities: connectCapabilitiesForCountry(country),
      business_profile: {
        name: owner.businessName,
        product_description: "Small business sales - checkout, pre-orders, subscriptions",
      },
      metadata: { ownerId: owner.id },
    });
    accountId = account.id;
    await prisma.owner.update({
      where: { id: owner.id },
      data: {
        stripeAccountId: accountId,
        stripeConnectStartedAt: owner.stripeConnectStartedAt ?? new Date(),
      },
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
  const { owner } = await requireOwnerWrite();
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
  const { owner } = await requireOwnerWrite();
  if (!owner.stripeAccountId) {
    redirect("/dashboard/settings/stripe");
  }

  const accountId = owner.stripeAccountId;
  await clearOwnerStripeLink(owner.id);

  if (isStripeConfigured()) {
    try {
      await getStripe().accounts.del(accountId);
    } catch (error) {
      console.error("Stripe connected-account delete after disconnect failed", error);
    }
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/settings/stripe?disconnected=1");
}
