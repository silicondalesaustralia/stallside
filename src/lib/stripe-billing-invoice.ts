import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  customerIdFromInvoice,
  subscriptionIdFromInvoice,
} from "@/lib/stripe-invoice-ids";

function ownerIdFromInvoiceMetadata(invoice: Stripe.Invoice): string | null {
  const fromSub = invoice.parent?.subscription_details?.metadata?.ownerId;
  if (typeof fromSub === "string" && fromSub.length > 0) return fromSub;

  const fromInvoice = invoice.metadata?.ownerId;
  if (typeof fromInvoice === "string" && fromInvoice.length > 0) {
    return fromInvoice;
  }
  return null;
}

/** Count SaaS invoice payments toward owner LTV. */
export async function recordSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.amount_paid <= 0) return;

  const subscriptionId = subscriptionIdFromInvoice(invoice);
  const customerId = customerIdFromInvoice(invoice);
  const metadataOwnerId = ownerIdFromInvoiceMetadata(invoice);

  if (!subscriptionId && !customerId && !metadataOwnerId) return;

  let owner = metadataOwnerId
    ? await prisma.owner.findUnique({ where: { id: metadataOwnerId } })
    : null;

  if (!owner && (customerId || subscriptionId)) {
    owner = await prisma.owner.findFirst({
      where: {
        OR: [
          ...(customerId ? [{ stripeCustomerId: customerId }] : []),
          ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
        ],
      },
    });
  }

  if (!owner) {
    console.error("Stripe invoice.paid: owner not found for LTV", {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      metadataOwnerId,
    });
    return;
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      lifetimePaidCents: { increment: invoice.amount_paid },
      subscriptionStartedAt: owner.subscriptionStartedAt ?? new Date(),
    },
  });
}
