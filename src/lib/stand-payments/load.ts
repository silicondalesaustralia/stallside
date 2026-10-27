import type { Owner } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { ownerSquareReady } from "@/lib/square/owner-ready";
import { ownerCardReady } from "./service";

export type ProviderStatus = "connected" | "finish_setup" | "not_connected";

function stripeStatus(owner: Owner): ProviderStatus {
  if (owner.stripeChargesEnabled) return "connected";
  return owner.stripeAccountId ? "finish_setup" : "not_connected";
}

async function squareStatus(owner: Owner): Promise<ProviderStatus | null> {
  if (!squareEligibleBillingCurrency(owner.billingCurrency)) return null;
  const conn = isSquareConnectEnabled() ? await getSquareConnection(owner.id) : null;
  if (conn?.status !== "ACTIVE") return "not_connected";
  return conn.paymentsEnabled ? "connected" : "finish_setup";
}

/** A business's checkout payment choices plus whether each provider is ready. Null when not owned. */
export async function loadOwnerStandPayments(owner: Owner, standId: string) {
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: {
      currency: true,
      acceptCash: true,
      acceptLocalTransfer: true,
      localTransferAlias: true,
      localTransferMethodId: true,
      acceptCard: true,
      acceptPayPal: true,
      acceptSquare: true,
      _count: { select: { products: { where: { isArchived: false } } } },
    },
  });
  if (!stand) return null;

  const method = localTransferForCurrency(stand.currency);
  const [square, squareReady] = await Promise.all([squareStatus(owner), ownerSquareReady(owner)]);
  return {
    stand,
    method,
    alias: method && stand.localTransferMethodId === method.id ? (stand.localTransferAlias ?? "") : "",
    cardReady: ownerCardReady(owner),
    stripe: stripeStatus(owner),
    square,
    squareReady,
    squareIsProvider: owner.onlinePaymentProvider === "SQUARE",
  };
}
