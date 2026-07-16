"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";

export async function updateStandPayments(standId: string, formData: FormData) {
  const { owner, user } = await requireOwner();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  const method = localTransferForCurrency(existing.currency);
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const cardReady = Boolean(
    cardTier && owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const paypalReady = Boolean(
    owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled,
  );

  const acceptCash = formData.get("acceptCash") === "on";
  // Disabled inputs are omitted from FormData — keep prior value.
  // Enabled + unchecked is also omitted — that must mean off (same as cash).
  const cardEditable = cardTier && cardReady;
  const paypalEditable = cardTier && paypalReady;
  const acceptCard = cardEditable
    ? formData.get("acceptCard") === "on"
    : existing.acceptCard;
  const acceptPayPal = paypalEditable
    ? formData.get("acceptPayPal") === "on"
    : existing.acceptPayPal;

  let acceptLocalTransfer = false;
  let localTransferAlias: string | null = null;
  let localTransferMethodId: string | null = null;

  if (method) {
    acceptLocalTransfer = formData.get("acceptLocalTransfer") === "on";
    const aliasRaw = String(formData.get("localTransferAlias") ?? "").trim();
    if (acceptLocalTransfer || aliasRaw) {
      if (acceptLocalTransfer && !aliasRaw) {
        return {
          error: `Enter your ${method.aliasLabel.toLowerCase()} to enable PayID.`,
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

  if (acceptCard && !cardTier) {
    return { error: "Card / Tap & Go requires the Card plan." };
  }
  if (acceptCard && !cardReady) {
    return { error: "Finish Stripe setup in Settings before enabling card." };
  }
  if (acceptPayPal && !paypalReady) {
    return { error: "Connect PayPal in Settings before enabling PayPal." };
  }
  if (!acceptCash && !acceptLocalTransfer && !acceptCard && !acceptPayPal) {
    return { error: "Leave at least one payment method enabled." };
  }

  await prisma.stand.update({
    where: { id: standId },
    data: {
      acceptCash,
      acceptLocalTransfer,
      acceptCard,
      acceptPayPal,
      localTransferAlias,
      localTransferMethodId,
    },
  });

  revalidatePath("/dashboard/stands");
  revalidatePath(`/dashboard/stands/${standId}`);
  revalidatePath(`/s/${existing.slug}`);
  return { ok: true as const };
}
