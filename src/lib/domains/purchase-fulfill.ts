/** Fulfill DomainPurchase after Stripe payment (register → Cloudflare → DNS). */

import { prisma } from "@/lib/prisma";
import { DomainPurchaseStatus } from "@/generated/prisma/client";
import { createNamecheapRegistrar } from "@/lib/domains/registrar/namecheap/provider";
import { connectPurchasedDomain } from "@/lib/domains/purchase-connect";
import { refundDomainPurchase } from "@/lib/domains/purchase-refund";
import type { AuEligibility, RegistrantContact } from "@/lib/domains/registrar/types";

function asRegistrant(json: unknown): RegistrantContact {
  const o = json as RegistrantContact;
  if (!o?.firstName || !o?.lastName || !o?.email) {
    throw new Error("Invalid registrant snapshot");
  }
  return o;
}

export async function fulfillDomainPurchase(purchaseId: string): Promise<void> {
  const purchase = await prisma.domainPurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase) return;
  if (purchase.status === DomainPurchaseStatus.ACTIVE) return;
  if (purchase.status === DomainPurchaseStatus.REGISTERED) {
    await connectPurchasedDomain(purchaseId);
    return;
  }
  if (purchase.status === DomainPurchaseStatus.CONNECTING) {
    await connectPurchasedDomain(purchaseId);
    return;
  }
  if (
    purchase.status !== DomainPurchaseStatus.AWAITING_PAYMENT &&
    purchase.status !== DomainPurchaseStatus.PAID &&
    purchase.status !== DomainPurchaseStatus.FAILED
  ) {
    return;
  }

  await prisma.domainPurchase.update({
    where: { id: purchase.id },
    data: { status: DomainPurchaseStatus.REGISTERING, lastError: null },
  });

  try {
    const registrar = createNamecheapRegistrar();
    const created = await registrar.registerDomain({
      domain: purchase.hostname,
      periodYears: purchase.registrationYears,
      registrant: asRegistrant(purchase.registrantJson),
      au: purchase.auEligibilityJson
        ? (purchase.auEligibilityJson as AuEligibility)
        : undefined,
      idempotencyKey: purchase.idempotencyKey,
    });
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: {
        status: DomainPurchaseStatus.REGISTERED,
        registrarDomainId: created.registrarDomainId,
        registeredAt: new Date(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: {
        status: DomainPurchaseStatus.FAILED,
        lastError: message.slice(0, 500),
      },
    });
    await refundDomainPurchase(purchase.id);
    throw err;
  }

  await connectPurchasedDomain(purchase.id);
}

export async function markDomainPurchasePaid(
  purchaseId: string,
  paymentIntentId: string | null,
) {
  await prisma.domainPurchase.updateMany({
    where: {
      id: purchaseId,
      status: DomainPurchaseStatus.AWAITING_PAYMENT,
    },
    data: {
      status: DomainPurchaseStatus.PAID,
      stripePaymentIntentId: paymentIntentId,
    },
  });
  await fulfillDomainPurchase(purchaseId);
}
