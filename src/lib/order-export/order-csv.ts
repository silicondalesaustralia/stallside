import { money, toCsv, zonedDateTime } from "./csv";
import {
  channelName,
  paymentMethodName,
  paymentProviderName,
  providerPaymentId,
  saleOriginName,
  statusName,
} from "./labels";
import type { ExportOrder } from "./load-export-orders";
import { orderAmounts } from "./order-amounts";

const HEADERS = [
  "Order number",
  "Date",
  "Store",
  "Channel",
  "Sale origin",
  "Payment status",
  "Payment method",
  "Payment provider",
  "Provider payment ID",
  "Currency",
  "Subtotal",
  "Discount",
  "Discount / promo",
  "Shipping",
  "Card surcharge",
  "Order total",
  "Amount paid",
  "Deposit",
  "Balance owing",
  "Balance due",
  "Vendl fee",
  "Net to you (est.)",
  "Item count",
  "Items",
  "Customer name",
  "Customer email",
  "Customer phone",
  "Fulfilment",
  "Collection / delivery date",
  "Delivery address",
  "Delivery suburb",
  "Delivery postcode",
  "Delivery notes",
  "Collection note",
  "Carrier",
  "Tracking number",
  "Shipped",
  "Delivered",
  "Order ID",
] as const;

function itemsSummary(order: ExportOrder): string {
  return order.items
    .map((i) => {
      const options = i.optionsSnapshot ? ` (${i.optionsSnapshot})` : "";
      return `${i.quantity} x ${i.productNameSnapshot}${options}`;
    })
    .join("; ");
}

export function ordersToCsv(orders: ExportOrder[], timeZone: string): string {
  const rows = orders.map((o) => {
    const a = orderAmounts(o);
    const discountLabel = [o.discountLabel, o.promotionCodeSnapshot]
      .filter(Boolean)
      .join(" / ");
    return [
      o.orderNumber,
      zonedDateTime(o.createdAt, timeZone),
      o.stand.name,
      channelName(o),
      saleOriginName(o.saleOrigin),
      statusName(o.paymentStatus),
      paymentMethodName(o.paymentMethod, o.localTransferMethodId),
      paymentProviderName(o.paymentMethod),
      providerPaymentId(o),
      o.currency,
      money(o.subtotalCents),
      money(o.discountCents),
      discountLabel,
      money(o.shippingCents),
      money(a.surchargeCents),
      money(o.totalCents),
      money(a.paidCents),
      money(o.depositCents),
      money(a.balanceOwingCents),
      zonedDateTime(o.balanceDueAt, timeZone),
      money(a.feeCents),
      money(a.netCents),
      o.items.reduce((sum, i) => sum + i.quantity, 0),
      itemsSummary(o),
      o.customerName,
      o.receiptEmail,
      o.customerPhone,
      o.isPreOrder ? (o.handoverMode === "DELIVER" ? "Delivery" : "Collection") : "",
      zonedDateTime(o.collectionAt, timeZone),
      o.deliveryAddressLine1,
      o.deliverySuburb,
      o.deliveryPostcode,
      o.deliveryNotes,
      o.collectionNote,
      o.shippingCarrier,
      o.trackingNumber,
      zonedDateTime(o.shippedAt, timeZone),
      zonedDateTime(o.deliveredAt, timeZone),
      o.id,
    ];
  });
  return toCsv(HEADERS, rows);
}
