import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/client";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { billingCentsToAud, type AudRates } from "@/lib/fx-to-aud";
import type { FeeBucket } from "@/lib/owner-ltv";
import { buildSalesSeries, type SeriesPoint } from "@/lib/sales-series";

export type MethodTotal = { audCents: number; count: number };

export type SalesTotals = {
  audCents: number;
  orderCount: number;
  byMethod: Record<PaymentMethod, MethodTotal>;
  /** Sales where Vendl took no fee (cash, PayID, Free for Life, Pro, subs). */
  noFeeAudCents: number;
  noFeeCount: number;
};

export type AdminSalesWindow = SalesTotals & { points: SeriesPoint[] };

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  LOCAL_TRANSFER: "PayID / transfer",
  CARD: "Card",
  PAYPAL: "PayPal",
  SQUARE: "Square",
};

/** Every counted sale regardless of payment method or fee, excluding demo stands. */
function countedSalesWhere() {
  const demoSlugs = [...demoStandSlugs()];
  return {
    paymentStatus: { in: COUNTED_STATUSES },
    ...(demoSlugs.length ? { stand: { slug: { notIn: demoSlugs } } } : {}),
  };
}

function emptyTotals(): SalesTotals {
  const byMethod = Object.fromEntries(
    Object.values(PaymentMethod).map((m) => [m, { audCents: 0, count: 0 }]),
  ) as Record<PaymentMethod, MethodTotal>;
  return { audCents: 0, orderCount: 0, byMethod, noFeeAudCents: 0, noFeeCount: 0 };
}

function addToTotals(
  totals: SalesTotals,
  row: { method: PaymentMethod; audCents: number; count: number; noFee: boolean },
) {
  totals.audCents += row.audCents;
  totals.orderCount += row.count;
  totals.byMethod[row.method].audCents += row.audCents;
  totals.byMethod[row.method].count += row.count;
  if (row.noFee) {
    totals.noFeeAudCents += row.audCents;
    totals.noFeeCount += row.count;
  }
}

/** Gross sales in a window, in AUD cents, with a daily/hourly series. */
export async function getAdminSalesWindow(
  start: Date,
  end: Date,
  rates: AudRates,
): Promise<AdminSalesWindow> {
  const orders = await prisma.order.findMany({
    where: { ...countedSalesWhere(), createdAt: { gte: start, lte: end } },
    select: {
      totalCents: true,
      currency: true,
      createdAt: true,
      paymentMethod: true,
      platformFeeCents: true,
    },
  });

  const totals = emptyTotals();
  const payments: { totalCents: number; createdAt: Date }[] = [];
  for (const order of orders) {
    const audCents = billingCentsToAud(order.totalCents, order.currency, rates);
    payments.push({ totalCents: audCents, createdAt: order.createdAt });
    addToTotals(totals, {
      method: order.paymentMethod,
      audCents,
      count: 1,
      noFee: order.platformFeeCents <= 0,
    });
  }
  return { ...totals, points: buildSalesSeries(payments, start, end) };
}

/** All-time gross sales across every stand, in AUD cents. */
export async function getAdminSalesAllTime(rates: AudRates): Promise<SalesTotals> {
  const [all, feeBearing] = await Promise.all([
    prisma.order.groupBy({
      by: ["paymentMethod", "currency"],
      where: countedSalesWhere(),
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["paymentMethod", "currency"],
      where: { ...countedSalesWhere(), platformFeeCents: { gt: 0 } },
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
  ]);

  const totals = emptyTotals();
  for (const row of all) {
    addToTotals(totals, {
      method: row.paymentMethod,
      audCents: billingCentsToAud(row._sum.totalCents ?? 0, row.currency, rates),
      count: row._count._all,
      noFee: true,
    });
  }
  for (const row of feeBearing) {
    totals.noFeeAudCents -= billingCentsToAud(
      row._sum.totalCents ?? 0,
      row.currency,
      rates,
    );
    totals.noFeeCount -= row._count._all;
  }
  return totals;
}

/** Gross counted sales per owner, grouped by currency. */
export async function salesByOwner(
  ownerIds: string[],
): Promise<Map<string, FeeBucket[]>> {
  const map = new Map<string, FeeBucket[]>();
  if (ownerIds.length === 0) return map;
  const rows = await prisma.order.groupBy({
    by: ["ownerId", "currency"],
    where: { ownerId: { in: ownerIds }, paymentStatus: { in: COUNTED_STATUSES } },
    _sum: { totalCents: true },
  });
  for (const row of rows) {
    const cents = row._sum.totalCents ?? 0;
    if (cents <= 0) continue;
    const list = map.get(row.ownerId) ?? [];
    list.push({ currency: row.currency, cents });
    map.set(row.ownerId, list);
  }
  return map;
}
