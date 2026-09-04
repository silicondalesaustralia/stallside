/** Start Buy-a-Domain checkout (Stripe payment → then register). */

import { createHash, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { DomainPurchaseStatus } from "@/generated/prisma/client";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  domainPurchaseEnabled,
  premiumDomainPurchaseEnabled,
} from "@/lib/domains/config";
import { createNamecheapRegistrar } from "@/lib/domains/registrar/namecheap/provider";
import { namecheapConfigured } from "@/lib/domains/registrar/namecheap/config";
import { domainTld } from "@/lib/domains/registrar/namecheap/au-attrs";
import { retailFromRegistrarUsd } from "@/lib/domains/registrar/retail-pricing";
import { LAUNCH_TLDS } from "@/lib/domains/registrar/search";
import type { AuEligibility, RegistrantContact } from "@/lib/domains/registrar/types";
import type { BillingCurrency } from "@/lib/saas-pricing";

export class DomainPurchaseError extends Error {
  constructor(
    message: string,
    readonly code: "disabled" | "unavailable" | "premium" | "config" | "stripe" | "invalid",
  ) {
    super(message);
    this.name = "DomainPurchaseError";
  }
}

export async function startDomainPurchaseCheckout(input: {
  ownerId: string;
  storefrontId: string;
  ownerEmail: string | null;
  domain: string;
  registrant: RegistrantContact;
  au?: AuEligibility;
  years?: number;
  retailCurrency?: BillingCurrency;
}): Promise<{ checkoutUrl: string; purchaseId: string }> {
  if (!domainPurchaseEnabled()) {
    throw new DomainPurchaseError("Domain purchase is not enabled", "disabled");
  }
  if (!namecheapConfigured() || !isStripeConfigured()) {
    throw new DomainPurchaseError("Purchase infrastructure not configured", "config");
  }

  const hostname = input.domain.trim().toLowerCase();
  const tld = domainTld(hostname);
  if (!(LAUNCH_TLDS as readonly string[]).includes(tld)) {
    throw new DomainPurchaseError("TLD not supported", "invalid");
  }
  if ((tld === "com.au" || tld === "net.au") && !input.au?.eligibilityId) {
    throw new DomainPurchaseError("AU eligibility details required", "invalid");
  }

  const registrar = createNamecheapRegistrar();
  const avail = await registrar.checkAvailability(hostname);
  if (!avail.available) {
    throw new DomainPurchaseError("Domain is no longer available", "unavailable");
  }
  if (avail.premium && !premiumDomainPurchaseEnabled()) {
    throw new DomainPurchaseError("Premium domains are not enabled", "premium");
  }

  const years = input.years ?? 1;
  const retailCurrency = input.retailCurrency ?? "AUD";
  const wholesale = await registrar.getRegistrationPrice(hostname, years);
  const renewal = await registrar.getRenewalPrice(hostname, 1);
  const { retail } = retailFromRegistrarUsd(wholesale, retailCurrency);
  const renewalRetail = retailFromRegistrarUsd(renewal, retailCurrency).retail;

  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: input.ownerId },
  });
  let customerId = owner.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: input.ownerEmail || owner.contactEmail || undefined,
      name: owner.businessName,
      metadata: { ownerId: owner.id },
    });
    customerId = customer.id;
    await prisma.owner.update({
      where: { id: owner.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const purchase = await prisma.domainPurchase.create({
    data: {
      ownerId: input.ownerId,
      storefrontId: input.storefrontId,
      hostname,
      tld,
      status: DomainPurchaseStatus.AWAITING_PAYMENT,
      registrationYears: years,
      registrarAmountCents: wholesale.value,
      registrarCurrency: wholesale.currencyCode,
      retailAmountCents: retail.value,
      retailCurrency: retail.currencyCode,
      renewalRetailCents: renewalRetail.value,
      idempotencyKey: createHash("sha256")
        .update(`${input.ownerId}:${hostname}:${randomUUID()}`)
        .digest("hex")
        .slice(0, 48),
      registrantJson: input.registrant,
      auEligibilityJson: input.au ?? undefined,
    },
  });

  const base = appBaseUrl();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: retail.currencyCode.toLowerCase(),
          unit_amount: retail.value,
          product_data: {
            name: `Domain: ${hostname}`,
            description: `1 year · renews ~${retail.currencyCode} ${(renewalRetail.value / 100).toFixed(2)}/yr`,
          },
        },
      },
    ],
    success_url: `${base}/dashboard/website/domains?purchased=1`,
    cancel_url: `${base}/dashboard/website/domains/buy?domain=${encodeURIComponent(hostname)}&currency=${encodeURIComponent(retailCurrency)}&cancelled=1`,
    metadata: {
      purpose: "domain_purchase",
      domainPurchaseId: purchase.id,
      ownerId: input.ownerId,
    },
    payment_intent_data: {
      metadata: { purpose: "domain_purchase", domainPurchaseId: purchase.id },
    },
  });

  if (!session.url) {
    throw new DomainPurchaseError("Could not start checkout", "stripe");
  }

  await prisma.domainPurchase.update({
    where: { id: purchase.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { checkoutUrl: session.url, purchaseId: purchase.id };
}
