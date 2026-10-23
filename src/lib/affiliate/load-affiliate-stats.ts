import { prisma } from "@/lib/prisma";
import { AffiliateCommissionStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { commissionFromCents } from "@/lib/affiliate/constants";
import { addToTotals, type CurrencyTotals } from "@/lib/affiliate/currency-totals";

export type ReferralRow = {
  id: string;
  businessName: string;
  joinedAt: Date;
  status: "Pro" | "Free for Life" | "Cancelled" | "Free";
  earned: CurrencyTotals;
};

export type AffiliateStats = {
  clicks: number;
  signups: number;
  livePro: number;
  monthlyCommission: CurrencyTotals;
  owed: CurrencyTotals;
  paid: CurrencyTotals;
  missed: CurrencyTotals;
  referrals: ReferralRow[];
};

type ReferralOwner = {
  lifetimeAccess: boolean;
  stripeSubscriptionId: string | null;
  monthlyFeeCents: number;
  subscriptionStatus: SubscriptionStatus;
};

export function isLivePaidPro(o: ReferralOwner): boolean {
  return (
    !o.lifetimeAccess &&
    o.stripeSubscriptionId != null &&
    o.monthlyFeeCents > 0 &&
    (o.subscriptionStatus === SubscriptionStatus.ACTIVE ||
      o.subscriptionStatus === SubscriptionStatus.PAST_DUE)
  );
}

function referralStatus(o: ReferralOwner): ReferralRow["status"] {
  if (isLivePaidPro(o)) return "Pro";
  if (o.lifetimeAccess) return "Free for Life";
  if (o.subscriptionStatus === SubscriptionStatus.CANCELLED) return "Cancelled";
  return "Free";
}

export async function loadAffiliateStats(ownerId: string): Promise<AffiliateStats> {
  const [clicks, referrals, commissions] = await Promise.all([
    prisma.affiliateClick.count({ where: { affiliateOwnerId: ownerId } }),
    prisma.owner.findMany({
      where: { referredByOwnerId: ownerId },
      orderBy: { referredAt: "desc" },
      select: {
        id: true,
        businessName: true,
        referredAt: true,
        createdAt: true,
        lifetimeAccess: true,
        stripeSubscriptionId: true,
        monthlyFeeCents: true,
        billingCurrency: true,
        subscriptionStatus: true,
      },
    }),
    prisma.affiliateCommission.findMany({
      where: { affiliateOwnerId: ownerId },
      select: {
        referredOwnerId: true,
        commissionCents: true,
        currency: true,
        status: true,
      },
    }),
  ]);

  const owed: CurrencyTotals = {};
  const paid: CurrencyTotals = {};
  const missed: CurrencyTotals = {};
  const earnedBy = new Map<string, CurrencyTotals>();
  for (const c of commissions) {
    if (c.status === AffiliateCommissionStatus.PENDING) {
      addToTotals(owed, c.currency, c.commissionCents);
    } else if (c.status === AffiliateCommissionStatus.PAID) {
      addToTotals(paid, c.currency, c.commissionCents);
    } else if (c.status === AffiliateCommissionStatus.INELIGIBLE) {
      addToTotals(missed, c.currency, c.commissionCents);
      continue;
    } else {
      continue;
    }
    const earned = earnedBy.get(c.referredOwnerId) ?? {};
    earnedBy.set(c.referredOwnerId, addToTotals(earned, c.currency, c.commissionCents));
  }

  const monthlyCommission: CurrencyTotals = {};
  let livePro = 0;
  for (const r of referrals) {
    if (!isLivePaidPro(r)) continue;
    livePro += 1;
    addToTotals(monthlyCommission, r.billingCurrency, commissionFromCents(r.monthlyFeeCents));
  }

  return {
    clicks,
    signups: referrals.length,
    livePro,
    monthlyCommission,
    owed,
    paid,
    missed,
    referrals: referrals.map((r) => ({
      id: r.id,
      businessName: r.businessName,
      joinedAt: r.referredAt ?? r.createdAt,
      status: referralStatus(r),
      earned: earnedBy.get(r.id) ?? {},
    })),
  };
}
