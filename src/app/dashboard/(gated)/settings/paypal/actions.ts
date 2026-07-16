"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isPayPalConfigured,
  isPayPalConnectAvailable,
  isPayPalDirectMode,
  paypalDirectMerchantId,
} from "@/lib/paypal";
import {
  hasComplimentaryAccess,
  ownerHasCardTierAccess,
} from "@/lib/owner-trial";
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

function assertPayPalConnectAvailable() {
  if (!isPayPalConnectAvailable()) {
    throw new Error("PayPal Connect is not available yet.");
  }
}

export async function startPayPalConnect() {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
  assertPayPalConnectAvailable();
  if (!isPayPalConfigured()) {
    throw new Error("PayPal is not configured on the server yet.");
  }

  if (isPayPalDirectMode()) {
    redirect("/dashboard/settings/paypal?partner=direct");
  }

  try {
    const url = await createPartnerReferralLink({
      trackingId: owner.id,
      email: owner.contactEmail || user.email,
      businessName: owner.businessName,
    });
    redirect(url);
  } catch (error) {
    if (
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("PayPal Partner Referrals failed", error);
    if (
      message.includes("403") ||
      message.includes("NOT_AUTHORIZED") ||
      message.includes("insufficient permissions")
    ) {
      redirect("/dashboard/settings/paypal?partner=denied");
    }
    redirect("/dashboard/settings/paypal?partner=error");
  }
}

/** Link this owner to the platform PayPal Business account (no Partner API). */
export async function connectPayPalDirect() {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
  assertPayPalConnectAvailable();

  const allowed =
    isPayPalDirectMode() ||
    hasComplimentaryAccess({ email: user.email, role: user.role });
  if (!allowed) {
    throw new Error("Direct PayPal connect is not enabled for this account.");
  }

  const merchantId = paypalDirectMerchantId();
  if (!merchantId || !isPayPalConfigured()) {
    throw new Error("PayPal direct merchant id is not configured.");
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      paypalMerchantId: merchantId,
      paypalOnboardingComplete: true,
      paypalPaymentsEnabled: true,
    },
  });

  revalidatePayPal();
  redirect("/dashboard/settings/paypal?connected=direct");
}

export async function refreshPayPalStatus(formData?: FormData) {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
  assertPayPalConnectAvailable();
  if (!isPayPalConfigured()) {
    redirect("/dashboard/settings/paypal");
  }

  const hint =
    formData instanceof FormData
      ? String(formData.get("merchantIdInPayPal") ?? "").trim()
      : "";

  // Direct-linked accounts: partner merchant-status APIs often 403 — keep local flags.
  if (
    owner.paypalMerchantId &&
    owner.paypalMerchantId === paypalDirectMerchantId()
  ) {
    revalidatePayPal();
    redirect("/dashboard/settings/paypal");
  }

  try {
    await syncPayPalMerchantStatus({
      ownerId: owner.id,
      trackingId: owner.id,
      existingMerchantId: owner.paypalMerchantId,
      existingPaymentsEnabled: owner.paypalPaymentsEnabled,
      merchantIdHint: hint || null,
    });
  } catch (error) {
    console.error("PayPal status refresh failed", error);
    redirect("/dashboard/settings/paypal?partner=error");
  }

  revalidatePayPal();
  redirect("/dashboard/settings/paypal");
}

export async function setPayPalPaymentsEnabled(formData: FormData) {
  const { owner, user } = await requireOwner();
  assertCardTier(owner, user);
  assertPayPalConnectAvailable();
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
