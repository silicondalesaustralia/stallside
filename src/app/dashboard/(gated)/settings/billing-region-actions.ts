"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import {
  countryFromBillingCurrency,
  squareEligibleBillingCurrency,
} from "@/lib/commerce/payment-rail";
import { OnlinePaymentProvider } from "@/generated/prisma/client";

export async function updateBillingRegionAction(formData: FormData) {
  const { owner } = await requireOwner();
  const raw = String(formData.get("billingCurrency") ?? "")
    .trim()
    .toUpperCase();
  if (!isBillingCurrency(raw)) {
    return;
  }
  const billingCurrency: BillingCurrency = raw;

  const data: {
    billingCurrency: string;
    country: string;
    onlinePaymentProvider?: OnlinePaymentProvider;
  } = {
    billingCurrency,
    country: countryFromBillingCurrency(billingCurrency),
  };

  if (
    !squareEligibleBillingCurrency(billingCurrency) &&
    owner.onlinePaymentProvider === OnlinePaymentProvider.SQUARE
  ) {
    data.onlinePaymentProvider = OnlinePaymentProvider.STRIPE;
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/square");
  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/settings/billing");
}
