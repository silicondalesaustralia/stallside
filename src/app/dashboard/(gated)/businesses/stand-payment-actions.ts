"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { OnlinePaymentProvider } from "@/generated/prisma/client";

export async function updateStandPayments(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  const method = localTransferForCurrency(existing.currency);
  const cardReady = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const paypalConnectAvailable = isPayPalConnectAvailable();
  const paypalReady = Boolean(
    paypalConnectAvailable &&
      owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled,
  );

  const squareEligible = squareEligibleBillingCurrency(owner.billingCurrency);
  let squareReady = false;
  if (squareEligible && isSquareConnectEnabled()) {
    const conn = await getSquareConnection(owner.id);
    squareReady =
      conn?.status === "ACTIVE" &&
      Boolean(conn.paymentsEnabled) &&
      Boolean(conn.primaryLocationId) &&
      owner.onlinePaymentProvider === OnlinePaymentProvider.SQUARE;
  }

  const acceptCash = formData.get("acceptCash") === "on";
  // Card / PayPal / Square checkboxes are disabled when not ready — treat as off.
  const acceptCard = cardReady ? formData.get("acceptCard") === "on" : false;
  const acceptPayPal =
    paypalConnectAvailable && paypalReady
      ? formData.get("acceptPayPal") === "on"
      : false;
  const acceptSquare = squareReady
    ? formData.get("acceptSquare") === "on"
    : false;

  let acceptLocalTransfer = false;
  let localTransferAlias: string | null = null;
  let localTransferMethodId: string | null = null;

  if (method) {
    acceptLocalTransfer = formData.get("acceptLocalTransfer") === "on";
    const aliasRaw = String(formData.get("localTransferAlias") ?? "").trim();
    if (acceptLocalTransfer || aliasRaw) {
      if (acceptLocalTransfer && !aliasRaw) {
        return {
          error: `Enter ${method.aliasLabel} to enable PayID.`,
        };
      }
      if (aliasRaw && !method.validate(aliasRaw)) {
        return {
          error: `Check ${method.aliasLabel.toLowerCase()} and try again.`,
        };
      }
      if (aliasRaw) {
        localTransferAlias = aliasRaw;
        localTransferMethodId = method.id;
      }
    }
  }

  if (acceptCard && !cardReady) {
    return { error: "Finish Stripe setup in Settings before enabling card." };
  }
  if (acceptPayPal && !paypalReady) {
    return { error: "Connect PayPal in Settings before enabling PayPal." };
  }
  if (acceptSquare && !squareReady) {
    return {
      error:
        "Connect Square, enable payments, and set Square as your online card provider before enabling.",
    };
  }
  if (
    !acceptCash &&
    !acceptLocalTransfer &&
    !acceptCard &&
    !acceptPayPal &&
    !acceptSquare
  ) {
    return { error: "Leave at least one payment method enabled." };
  }

  await prisma.stand.update({
    where: { id: standId },
    data: {
      acceptCash,
      acceptLocalTransfer,
      acceptCard,
      acceptPayPal,
      acceptSquare,
      localTransferAlias,
      localTransferMethodId,
    },
  });

  revalidatePath("/dashboard/checkout");
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath(`/s/${existing.slug}`);
  revalidateTag(standCatalogTag(existing.slug), "max");
  return { ok: true as const };
}
