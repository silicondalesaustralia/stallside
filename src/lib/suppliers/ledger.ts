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
  linked: boolean;
  autoApprove: boolean;
  pendingUnits: number;
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
  const [owned, access, added, lines, paid, lots] = await Promise.all([
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
    prisma.supplierProductAccess.findMany({
      where: { memberId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stockQuantity: true,
            isArchived: true,
            priceCents: true,
            currency: true,
          },
        },
      },
      orderBy: { product: { name: "asc" } },
    }),
    prisma.inventoryAdjustment.groupBy({
      by: ["productId"],
      where: { memberId, changeQuantity: { gt: 0 } },
      _sum: { changeQuantity: true },
    }),
    prisma.orderItem.findMany({
      where: { memberId, order: { paymentStatus: { in: PAID } } },
      select: { productId: true, quantity: true, supplierUnitCents: true },
    }),
    prisma.supplierPayout.aggregate({
      where: { memberId },
      _sum: { amountCents: true },
    }),
    prisma.stockLot.groupBy({
      by: ["productId", "status"],
      where: { memberId },
      _sum: { quantityRemaining: true },
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
  const onHandByProduct = new Map<string, number>();
  const pendingByProduct = new Map<string, number>();
  for (const row of lots) {
    const qty = row._sum.quantityRemaining ?? 0;
    if (row.status === "ACTIVE") {
      onHandByProduct.set(row.productId, qty);
    } else if (row.status === "PENDING") {
      pendingByProduct.set(row.productId, qty);
    }
  }

  const linkedIds = new Set(access.map((row) => row.productId));
  const rows: SupplierProductRow[] = [
    ...access.map((row) => {
      const sold = soldByProduct.get(row.productId);
      return {
        id: row.product.id,
        name: row.product.name,
        stockQuantity: onHandByProduct.get(row.productId) ?? 0,
        isArchived: row.product.isArchived,
        priceCents: row.product.priceCents,
        supplierUnitCents: row.supplierUnitCents,
        currency: row.product.currency,
        unitsAdded: addedByProduct.get(row.productId) ?? 0,
        unitsSold: sold?.qty ?? 0,
        owedCents: sold?.owed ?? 0,
        linked: true,
        autoApprove: row.autoApprove,
        pendingUnits: pendingByProduct.get(row.productId) ?? 0,
      };
    }),
    ...owned
      .filter((product) => !linkedIds.has(product.id))
      .map((product) => {
        const sold = soldByProduct.get(product.id);
        return {
          ...product,
          unitsAdded: addedByProduct.get(product.id) ?? 0,
          unitsSold: sold?.qty ?? 0,
          owedCents: sold?.owed ?? 0,
          linked: false,
          autoApprove: true,
          pendingUnits: 0,
        };
      }),
  ];

  return {
    products: rows,
    unitsAdded: rows.reduce((sum, row) => sum + row.unitsAdded, 0),
    unitsSold: rows.reduce((sum, row) => sum + row.unitsSold, 0),
    onHand: rows.reduce((sum, row) => sum + row.stockQuantity, 0),
    owedCents: rows.reduce((sum, row) => sum + row.owedCents, 0),
    paidCents: paid._sum.amountCents ?? 0,
  };
}
