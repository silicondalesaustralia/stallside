"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OnlinePaymentProvider } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isBillingCurrency } from "@/lib/saas-pricing";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";

const BILLING_PATH = "/dashboard/settings/billing";

export async function updateBillingRegion(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const raw = String(formData.get("currency") ?? "").trim().toUpperCase();
  if (!isBillingCurrency(raw)) {
    redirect(`${BILLING_PATH}?error=region_invalid`);
  }
  if (owner.stripeAccountId || owner.stripeSubscriptionId) {
    redirect(`${BILLING_PATH}?error=region_locked`);
  }

  try {
    await prisma.owner.update({
      where: { id: owner.id },
      data: {
        billingCurrency: raw,
        ...(squareEligibleBillingCurrency(raw)
          ? {}
          : { onlinePaymentProvider: OnlinePaymentProvider.STRIPE }),
      },
    });
  } catch (error) {
    console.error("Billing region update failed", error);
    redirect(`${BILLING_PATH}?error=region_failed`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`${BILLING_PATH}?region=1`);
}
