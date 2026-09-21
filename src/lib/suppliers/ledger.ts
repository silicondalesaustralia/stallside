import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAID = [PaymentStatus.PAID, PaymentStatus.CUSTOMER_CONFIRMED];

export type SupplierProductRow = {
  id: string;
  name: string;
  stockQuantity: number;
  isArchived: boolean;
  priceCents: number;
  supplierUnitCents: number | null;
  currency: string;
  unitsAdded: number;
  unitsSold: number;
  owedCents: number;
};

export type SupplierLedger = {
  products: SupplierProductRow[];
  unitsAdded: number;
  unitsSold: number;
  onHand: number;
  owedCents: number;
  paidCents: number;
};

export async function loadSupplierLedger(memberId: string): Promise<SupplierLedger> {
  const [products, added, lines, paid] = await Promise.all([
    prisma.product.findMany({
      where: { memberId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        isArchived: true,
        priceCents: true,
        supplierUnitCents: true,
        currency: true,
      },
    }),
    prisma.inventoryAdjustment.groupBy({
      by: ["productId"],
      where: { memberId, changeQuantity: { gt: 0 } },
      _sum: { changeQuantity: true },
    }),
    prisma.orderItem.findMany({
      where: {
        memberId,
        order: { paymentStatus: { in: PAID } },
      },
      select: {
        productId: true,
        quantity: true,
        supplierUnitCents: true,
      },
    }),
    prisma.supplierPayout.aggregate({
      where: { memberId },
      _sum: { amountCents: true },
    }),
  ]);

  const addedByProduct = new Map(
    added.map((row) => [row.productId, row._sum.changeQuantity ?? 0]),
  );
  const soldByProduct = new Map<string, { qty: number; owed: number }>();
  for (const line of lines) {
    const current = soldByProduct.get(line.productId) ?? { qty: 0, owed: 0 };
    current.qty += line.quantity;
    if (line.supplierUnitCents != null) {
      current.owed += line.quantity * line.supplierUnitCents;
    }
    soldByProduct.set(line.productId, current);
  }

  const rows: SupplierProductRow[] = products.map((product) => {
    const sold = soldByProduct.get(product.id);
    return {
      ...product,
      unitsAdded: addedByProduct.get(product.id) ?? 0,
      unitsSold: sold?.qty ?? 0,
      owedCents: sold?.owed ?? 0,
    };
  });

  return {
    products: rows,
    unitsAdded: rows.reduce((sum, row) => sum + row.unitsAdded, 0),
    unitsSold: rows.reduce((sum, row) => sum + row.unitsSold, 0),
    onHand: rows.reduce((sum, row) => sum + row.stockQuantity, 0),
    owedCents: rows.reduce((sum, row) => sum + row.owedCents, 0),
    paidCents: paid._sum.amountCents ?? 0,
  };
}
