import {
  FulfilmentStatus,
  HandoverMode,
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
  type Prisma,
} from "@/generated/prisma/client";
import { decrementStockForOrder } from "@/lib/checkout";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";

type Tx = Prisma.TransactionClient;

export type CashSaleLine = {
  productId: string;
  name: string;
  priceCents: number;
  stockQuantity: number;
  quantity: number;
};

export type CreateCashSaleInput = {
  ownerId: string;
  standId: string;
  currency: string;
  line: CashSaleLine;
  customerName?: string | null;
  email?: string | null;
  phone?: string | null;
  sellerEventId?: string | null;
  customOrderRequestId?: string | null;
  fulfilmentStatus?: FulfilmentStatus;
  paymentStatus?: PaymentStatus;
  reason?: string;
};

/** Single-line cash order + stock adjust (once). No double-decrement. */
export async function createCashSaleOrder(tx: Tx, input: CreateCashSaleInput) {
  const qty = input.line.quantity;
  if (!Number.isFinite(qty) || qty < 1) throw new Error("Invalid quantity");
  if (input.line.stockQuantity < qty) throw new Error("STOCK");

  const unitPriceCents = input.line.priceCents;
  const lineTotalCents = unitPriceCents * qty;
  const email = normalizeReceiptEmail(input.email ?? "") || null;
  const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;
  const fulfilmentStatus =
    input.fulfilmentStatus ?? FulfilmentStatus.NEW;

  const created = await tx.order.create({
    data: {
      standId: input.standId,
      ownerId: input.ownerId,
      orderNumber,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: input.paymentStatus ?? PaymentStatus.CUSTOMER_CONFIRMED,
      subtotalCents: lineTotalCents,
      totalCents: lineTotalCents,
      currency: input.currency,
      platformFeeCents: 0,
      receiptChannel: email ? ReceiptChannel.EMAIL : ReceiptChannel.NONE,
      receiptEmail: email,
      customerName: input.customerName?.trim() || null,
      customerPhone: input.phone?.trim() || null,
      handoverMode: HandoverMode.COLLECT,
      sellerEventId: input.sellerEventId ?? null,
      customOrderRequestId: input.customOrderRequestId ?? null,
      collectionStatus:
        fulfilmentStatus === FulfilmentStatus.COLLECTED
          ? "COLLECTED"
          : fulfilmentStatus === FulfilmentStatus.READY
            ? "READY"
            : "ORDERED",
      items: {
        create: [
          {
            productId: input.line.productId,
            productNameSnapshot: input.line.name,
            quantity: qty,
            unitPriceCents,
            lineTotalCents,
          },
        ],
      },
      fulfilment: {
        create: {
          kind: "STAND_IMMEDIATE",
          optionLabel: input.sellerEventId ? "Market sale" : "Custom order",
          handoverMode: HandoverMode.COLLECT,
          fulfilmentStatus,
        },
      },
    },
  });

  await decrementStockForOrder(tx, {
    items: [{ productId: input.line.productId, quantity: qty }],
    byId: new Map([
      [
        input.line.productId,
        { id: input.line.productId, stockQuantity: input.line.stockQuantity },
      ],
    ]),
    ownerId: input.ownerId,
    standId: input.standId,
    orderId: created.id,
    source: InventorySource.ORDER_CASH,
    reason: input.reason ?? "Cash sale",
  });

  return created;
}
