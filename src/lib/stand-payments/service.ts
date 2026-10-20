import { revalidatePath, revalidateTag } from "next/cache";
import type { Owner } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import { ownerSquareReady } from "@/lib/square/owner-ready";

export type StandPaymentChoices = {
  acceptCash: boolean;
  acceptLocalTransfer: boolean;
  localTransferAlias: string;
  acceptCard: boolean;
  acceptPayPal: boolean;
  acceptSquare: boolean;
};

type Result = { ok: true } | { error: string };

export function ownerCardReady(owner: Owner): boolean {
  return Boolean(owner.stripeAccountId && owner.stripeChargesEnabled);
}

function ownerPayPalReady(owner: Owner): boolean {
  return Boolean(
    isPayPalConnectAvailable() &&
      owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled,
  );
}

/** Saves which methods a business offers at checkout. Methods whose provider isn't ready are saved as off. */
export async function saveOwnerStandPayments(
  owner: Owner,
  standId: string,
  choices: StandPaymentChoices,
): Promise<Result> {
  const existing = await prisma.stand.findFirst({ where: { id: standId, ownerId: owner.id } });
  if (!existing) return { error: "Stand not found." };

  const method = localTransferForCurrency(existing.currency);
  const acceptCard = ownerCardReady(owner) && choices.acceptCard;
  const acceptPayPal = ownerPayPalReady(owner) && choices.acceptPayPal;
  const acceptSquare = (await ownerSquareReady(owner)) && choices.acceptSquare;

  let acceptLocalTransfer = false;
  let localTransferAlias: string | null = null;
  let localTransferMethodId: string | null = null;
  if (method) {
    acceptLocalTransfer = choices.acceptLocalTransfer;
    const alias = choices.localTransferAlias.trim();
    if (acceptLocalTransfer && !alias) {
      return { error: `Enter your ${method.aliasLabel.toLowerCase()} to enable PayID.` };
    }
    if (alias && !method.validate(alias)) {
      return { error: `Check ${method.aliasLabel.toLowerCase()} and try again.` };
    }
    if (alias) {
      localTransferAlias = alias;
      localTransferMethodId = method.id;
    }
  }

  if (!choices.acceptCash && !acceptLocalTransfer && !acceptCard && !acceptPayPal && !acceptSquare) {
    return { error: "Leave at least one payment method enabled." };
  }

  await prisma.stand.update({
    where: { id: standId },
    data: {
      acceptCash: choices.acceptCash,
      acceptLocalTransfer,
      acceptCard,
      acceptPayPal,
      acceptSquare,
      localTransferAlias,
      localTransferMethodId,
    },
  });

  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath(`/s/${existing.slug}`);
  revalidateTag(standCatalogTag(existing.slug), "max");
  return { ok: true };
}
