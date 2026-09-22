import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export type LotShare = {
  memberId: string | null;
  supplierUnitCents: number | null;
  quantity: number;
};

/** Drain ACTIVE lots oldest-first. Leftover qty is owner stock (null member). */
export async function consumeStockLots(
  tx: Tx,
  productId: string,
  quantity: number,
): Promise<LotShare[]> {
  if (quantity < 1) return [];

  const lots = await tx.stockLot.findMany({
    where: { productId, status: "ACTIVE", quantityRemaining: { gt: 0 } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      memberId: true,
      supplierUnitCents: true,
      quantityRemaining: true,
    },
  });

  let left = quantity;
  const shares: LotShare[] = [];
  for (const lot of lots) {
    if (left <= 0) break;
    const take = Math.min(lot.quantityRemaining, left);
    await tx.stockLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: lot.quantityRemaining - take },
    });
    shares.push({
      memberId: lot.memberId,
      supplierUnitCents: lot.supplierUnitCents,
      quantity: take,
    });
    left -= take;
  }
  if (left > 0) {
    shares.push({ memberId: null, supplierUnitCents: null, quantity: left });
  }
  return mergeShares(shares);
}

function mergeShares(shares: LotShare[]): LotShare[] {
  const out: LotShare[] = [];
  for (const share of shares) {
    const last = out[out.length - 1];
    if (
      last &&
      last.memberId === share.memberId &&
      last.supplierUnitCents === share.supplierUnitCents
    ) {
      last.quantity += share.quantity;
    } else {
      out.push({ ...share });
    }
  }
  return out;
}

/** Rewrite one order line into lot shares (split when FIFO crosses suppliers). */
export async function applyLotSharesToOrderItem(
  tx: Tx,
  orderItemId: string,
  shares: LotShare[],
) {
  const item = await tx.orderItem.findUnique({ where: { id: orderItemId } });
  if (!item || shares.length === 0) return;

  if (shares.length === 1) {
    await tx.orderItem.update({
      where: { id: item.id },
      data: {
        memberId: shares[0].memberId,
        supplierUnitCents: shares[0].supplierUnitCents,
      },
    });
    return;
  }

  await tx.orderItem.delete({ where: { id: item.id } });
  for (const share of shares) {
    if (share.quantity < 1) continue;
    await tx.orderItem.create({
      data: {
        orderId: item.orderId,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        optionsSnapshot: item.optionsSnapshot,
        quantity: share.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.unitPriceCents * share.quantity,
        memberId: share.memberId,
        supplierUnitCents: share.supplierUnitCents,
      },
    });
  }
}
