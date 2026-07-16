"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isPayPalConfigured } from "@/lib/paypal";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { createPartnerReferralLink } from "@/lib/paypal-connect";
import { syncPayPalMerchantStatus } from "@/lib/paypal-sync";

function revalidatePayPal() {
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/paypal");
}

function assertCardTier(
  owner: { subscriptionPlan?: string | null },
  user: { email?: string | null; role?: string | null },
) {
  if (
    !ownerHasCardTierAccess(owner, { email: user.email, role: user.role })
  ) {
    throw new Error("PayPal requires the Card plan.");
  }
}

export async function startPayPalConnect() {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
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

export async function refreshPayPalStatus(formData?: FormData) {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
  if (!isPayPalConfigured()) {
    redirect("/dashboard/settings/paypal");
  }

  const hint =
    formData instanceof FormData
      ? String(formData.get("merchantIdInPayPal") ?? "").trim()
      : "";

  await syncPayPalMerchantStatus({
    ownerId: owner.id,
    trackingId: owner.id,
    existingMerchantId: owner.paypalMerchantId,
    existingPaymentsEnabled: owner.paypalPaymentsEnabled,
    merchantIdHint: hint || null,
  });

  revalidatePayPal();
  redirect("/dashboard/settings/paypal");
}

export async function setPayPalPaymentsEnabled(formData: FormData) {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
  const enabled = formData.get("enabled") === "1";

  if (enabled && (!owner.paypalMerchantId || !owner.paypalOnboardingComplete)) {
    throw new Error("Connect PayPal before enabling checkout.");
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: { paypalPaymentsEnabled: enabled },
  });

  revalidatePayPal();
}
