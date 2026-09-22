import { prisma } from "@/lib/prisma";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import {
  audRatesFromMarket,
  billingCentsToAud,
  type AudRates,
} from "@/lib/fx-to-aud";

export type VendorSalesTotals = {
  salesAudCents: number;
  orderCount: number;
};

/** Counted GMV across all vendors (excludes demo stands), in AUD. */
export async function getVendorSalesTotals(input?: {
  start?: Date;
  end?: Date;
  rates?: AudRates;
}): Promise<VendorSalesTotals> {
  const fx = input?.rates ?? (await audRatesFromMarket());
  const demoSlugs = [...demoStandSlugs()];
  const hasWindow = input?.start != null && input?.end != null;

  const rows = await prisma.order.groupBy({
    by: ["currency"],
    where: {
      paymentStatus: { in: COUNTED_STATUSES },
      ...(hasWindow
        ? { createdAt: { gte: input.start, lte: input.end } }
        : {}),
      ...(demoSlugs.length
        ? { stand: { slug: { notIn: demoSlugs } } }
        : {}),
    },
    _sum: { totalCents: true },
    _count: { _all: true },
  });

  let salesAudCents = 0;
  let orderCount = 0;
  for (const row of rows) {
    orderCount += row._count._all;
    salesAudCents += billingCentsToAud(
      row._sum.totalCents ?? 0,
      row.currency,
      fx,
    );
  }
  return { salesAudCents, orderCount };
}
