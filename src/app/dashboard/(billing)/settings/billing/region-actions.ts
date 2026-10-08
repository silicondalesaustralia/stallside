"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OnlinePaymentProvider } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isBillingCurrency } from "@/lib/saas-pricing";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { getSquareConnection } from "@/lib/square/connection";
import { connectionSquareRegion, squareRegionForCurrency } from "@/lib/square/region";

const BILLING_PATH = "/dashboard/settings/billing";

/** A connected Square account is tied to its country's Vendl app, so the region can't move away from it. */
async function squareBlocksRegion(ownerId: string, currency: string): Promise<boolean> {
  try {
    const conn = await getSquareConnection(ownerId);
    if (conn?.status !== "ACTIVE") return false;
    return connectionSquareRegion(conn) !== squareRegionForCurrency(currency);
  } catch (error) {
    console.error("Square region check failed", ownerId, error);
    return true;
  }
}

export async function updateBillingRegion(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const raw = String(formData.get("currency") ?? "").trim().toUpperCase();
  if (!isBillingCurrency(raw)) {
    redirect(`${BILLING_PATH}?error=region_invalid`);
  }
  if (owner.stripeAccountId || owner.stripeSubscriptionId) {
    redirect(`${BILLING_PATH}?error=region_locked`);
  }
  if (await squareBlocksRegion(owner.id, raw)) {
    redirect(`${BILLING_PATH}?error=region_square`);
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
