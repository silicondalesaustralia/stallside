"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isPayPalConfigured } from "@/lib/paypal";
import {
  createPartnerReferralLink,
  getMerchantIntegrationStatus,
  lookupMerchantByTrackingId,
  merchantPaymentsReady,
} from "@/lib/paypal-connect";

export async function startPayPalConnect() {
  const { owner, user } = await requireOwner();
  if (!isPayPalConfigured()) {
    throw new Error("PayPal is not configured on the server yet.");
  }

  const url = await createPartnerReferralLink({
    trackingId: owner.id,
    email: owner.contactEmail || user.email,
    businessName: owner.businessName,
  });

  redirect(url);
}

export async function refreshPayPalStatus(
  merchantIdOrForm?: string | FormData | null,
) {
  const { owner } = await requireOwner();
  if (!isPayPalConfigured()) {
    redirect("/dashboard/settings/paypal");
  }

  const merchantIdFromReturn =
    typeof merchantIdOrForm === "string" ? merchantIdOrForm.trim() : "";
  let merchantId = merchantIdFromReturn || owner.paypalMerchantId;

  if (!merchantId) {
    try {
      const looked = await lookupMerchantByTrackingId(owner.id);
      merchantId = looked.merchant_id ?? null;
    } catch (error) {
      console.error("PayPal tracking lookup failed", error);
    }
  }

  if (!merchantId) {
    redirect("/dashboard/settings/paypal");
  }

  const status = await getMerchantIntegrationStatus(merchantId);
  const ready = merchantPaymentsReady(status);

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      paypalMerchantId: merchantId,
      paypalOnboardingComplete: ready || Boolean(status.primary_email_confirmed),
      paypalPaymentsEnabled: ready,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/paypal");
  redirect("/dashboard/settings/paypal");
}
