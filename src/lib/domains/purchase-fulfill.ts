/** Fulfill DomainPurchase after Stripe payment (register → DNS → Cloudflare). */

import { prisma } from "@/lib/prisma";
import { DomainPurchaseStatus } from "@/generated/prisma/client";
import { cloudflareSaasCnameTarget } from "@/lib/domains/config";
import { connectCustomDomain } from "@/lib/domains/lifecycle";
import { createNamecheapRegistrar } from "@/lib/domains/registrar/namecheap/provider";
import { namecheapSetWwwCname } from "@/lib/domains/registrar/namecheap/dns";
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

async function connectPurchasedDomain(purchaseId: string) {
  const purchase = await prisma.domainPurchase.findUniqueOrThrow({
    where: { id: purchaseId },
    include: {
      owner: { include: { user: { select: { email: true, role: true } } } },
    },
  });

  await prisma.domainPurchase.update({
    where: { id: purchase.id },
    data: { status: DomainPurchaseStatus.CONNECTING },
  });

  try {
    await namecheapSetWwwCname(purchase.hostname, cloudflareSaasCnameTarget());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: { lastError: `DNS: ${msg}`.slice(0, 500) },
    });
  }

  try {
    const row = await connectCustomDomain({
      storefrontId: purchase.storefrontId,
      owner: purchase.owner,
      hostname: `www.${purchase.hostname}`,
    });
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: {
        status: DomainPurchaseStatus.ACTIVE,
        storefrontDomainId: row.id,
        lastError: null,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: {
        status: DomainPurchaseStatus.REGISTERED,
        lastError: `Connect: ${msg}`.slice(0, 500),
      },
    });
  }
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
