import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AffiliateCommissionStatus } from "@/generated/prisma/client";
import { commissionFromCents } from "@/lib/affiliate/constants";
import {
  affiliateEligibilitySelect,
  isAffiliateEligible,
} from "@/lib/affiliate/eligibility";

/** Invoice amount excluding GST/VAT/sales tax, capped at what was actually paid. */
function invoiceNetCents(invoice: Stripe.Invoice): number {
  const exTax = invoice.total_excluding_tax ?? invoice.amount_paid;
  return Math.max(0, Math.min(exTax, invoice.amount_paid));
}

/**
 * Record 50% of a referred owner's paid SaaS invoice for their affiliate.
 * Affiliate not on Pro when paid: stored as INELIGIBLE (lost, not held).
 */
export async function recordAffiliateCommission(
  referredOwner: { id: string; referredByOwnerId: string | null },
  invoice: Stripe.Invoice,
): Promise<void> {
  if (!referredOwner.referredByOwnerId || !invoice.id) return;
  const netCents = invoiceNetCents(invoice);
  if (netCents <= 0) return;

  try {
    const affiliate = await prisma.owner.findUnique({
      where: { id: referredOwner.referredByOwnerId },
      select: { id: true, ...affiliateEligibilitySelect },
    });
    if (!affiliate) return;

    const status = isAffiliateEligible(affiliate)
      ? AffiliateCommissionStatus.PENDING
      : AffiliateCommissionStatus.INELIGIBLE;

    await prisma.affiliateCommission.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        affiliateOwnerId: affiliate.id,
        referredOwnerId: referredOwner.id,
        stripeInvoiceId: invoice.id,
        invoiceAmountCents: netCents,
        commissionCents: commissionFromCents(netCents),
        currency: invoice.currency.toUpperCase(),
        status,
        earnedAt: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date(),
      },
      update: {},
    });
  } catch (error) {
    console.error("Affiliate commission record failed", {
      invoiceId: invoice.id,
      referredOwnerId: referredOwner.id,
      error,
    });
  }
}

/** Refunded invoice: void any unpaid commission for it. */
export async function voidAffiliateCommission(stripeInvoiceId: string) {
  await prisma.affiliateCommission.updateMany({
    where: {
      stripeInvoiceId,
      status: {
        in: [AffiliateCommissionStatus.PENDING, AffiliateCommissionStatus.INELIGIBLE],
      },
    },
    data: { status: AffiliateCommissionStatus.VOID },
  });
}
