import { prisma } from "@/lib/prisma";
import { AffiliateCommissionStatus } from "@/generated/prisma/client";
import { audRatesFromMarket } from "@/lib/fx-to-aud";
import { commissionFromCents } from "@/lib/affiliate/constants";
import {
  affiliateEligibilitySelect,
  isAffiliateEligible,
} from "@/lib/affiliate/eligibility";
import { isLivePaidPro } from "@/lib/affiliate/load-affiliate-stats";
import {
  addToTotals,
  totalsToAud,
  type CurrencyTotals,
} from "@/lib/affiliate/currency-totals";

export type AdminAffiliateRow = {
  id: string;
  businessName: string;
  email: string;
  code: string | null;
  eligible: boolean;
  clicks: number;
  signups: number;
  livePro: number;
  monthly: CurrencyTotals;
  owed: CurrencyTotals;
  paid: CurrencyTotals;
  missed: CurrencyTotals;
  owedAud: number;
};

const STATUS_KEY = {
  [AffiliateCommissionStatus.PENDING]: "owed",
  [AffiliateCommissionStatus.PAID]: "paid",
  [AffiliateCommissionStatus.INELIGIBLE]: "missed",
} as const;

export async function loadAdminAffiliates() {
  const [affiliates, clicks, referred, commissions, fx] = await Promise.all([
    prisma.owner.findMany({
      where: { OR: [{ referralCode: { not: null } }, { referrals: { some: {} } }] },
      select: { id: true, businessName: true, contactEmail: true, referralCode: true, ...affiliateEligibilitySelect },
    }),
    prisma.affiliateClick.groupBy({ by: ["affiliateOwnerId"], _count: { _all: true } }),
    prisma.owner.findMany({
      where: { referredByOwnerId: { not: null } },
      select: {
        referredByOwnerId: true,
        lifetimeAccess: true,
        stripeSubscriptionId: true,
        monthlyFeeCents: true,
        billingCurrency: true,
        subscriptionStatus: true,
      },
    }),
    prisma.affiliateCommission.groupBy({
      by: ["affiliateOwnerId", "status", "currency"],
      _sum: { commissionCents: true },
    }),
    audRatesFromMarket(),
  ]);

  const rows = new Map<string, AdminAffiliateRow>();
  for (const a of affiliates) {
    rows.set(a.id, {
      id: a.id,
      businessName: a.businessName,
      email: a.user.email,
      code: a.referralCode,
      eligible: isAffiliateEligible(a),
      clicks: 0,
      signups: 0,
      livePro: 0,
      monthly: {},
      owed: {},
      paid: {},
      missed: {},
      owedAud: 0,
    });
  }
  for (const c of clicks) {
    const row = rows.get(c.affiliateOwnerId);
    if (row) row.clicks = c._count._all;
  }
  for (const r of referred) {
    const row = r.referredByOwnerId ? rows.get(r.referredByOwnerId) : undefined;
    if (!row) continue;
    row.signups += 1;
    if (!isLivePaidPro(r)) continue;
    row.livePro += 1;
    addToTotals(row.monthly, r.billingCurrency, commissionFromCents(r.monthlyFeeCents));
  }
  for (const c of commissions) {
    const row = rows.get(c.affiliateOwnerId);
    if (!row || c.status === AffiliateCommissionStatus.VOID) continue;
    addToTotals(row[STATUS_KEY[c.status]], c.currency, c._sum.commissionCents ?? 0);
  }

  const list = [...rows.values()];
  for (const row of list) row.owedAud = totalsToAud(row.owed, fx);
  list.sort((a, b) => b.owedAud - a.owedAud || b.livePro - a.livePro || b.signups - a.signups);

  const sumAud = (pick: (r: AdminAffiliateRow) => CurrencyTotals) =>
    list.reduce((sum, r) => sum + totalsToAud(pick(r), fx), 0);

  return {
    rows: list,
    totals: {
      affiliates: list.filter((r) => r.code).length,
      clicks: list.reduce((s, r) => s + r.clicks, 0),
      signups: list.reduce((s, r) => s + r.signups, 0),
      livePro: list.reduce((s, r) => s + r.livePro, 0),
      monthlyAud: sumAud((r) => r.monthly),
      owedAud: sumAud((r) => r.owed),
      paidAud: sumAud((r) => r.paid),
      missedAud: sumAud((r) => r.missed),
    },
  };
}
