import { money, toCsv, zonedDateTime } from "./csv";
import { paymentMethodName, statusName } from "./labels";
import type { ExportOrder } from "./load-export-orders";

const HEADERS = [
  "Order number",
  "Date",
  "Store",
  "Payment status",
  "Payment method",
  "Product",
  "Options",
  "SKU",
  "Quantity",
  "Unit price",
  "Line total",
  "GST-free",
  "GST",
  "Currency",
  "Product ID",
  "Order ID",
] as const;

export function orderLinesToCsv(orders: ExportOrder[], timeZone: string): string {
  const rows = orders.flatMap((o) =>
    o.items.map((i) => [
      o.orderNumber,
      zonedDateTime(o.createdAt, timeZone),
      o.stand.name,
      statusName(o.paymentStatus),
      paymentMethodName(o.paymentMethod, o.localTransferMethodId),
      i.productNameSnapshot,
      i.optionsSnapshot,
      i.product.sku,
      i.quantity,
      money(i.unitPriceCents),
      money(i.lineTotalCents),
      i.gstFree ? "Yes" : "No",
      money(i.gstCents),
      o.currency,
      i.productId,
      o.id,
    ]),
  );
  return toCsv(HEADERS, rows);
}
