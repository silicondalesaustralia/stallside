import { dashCtaClass } from "@/components/DashPrimaryCta";
import { formatMoney } from "@/lib/money";
import { quickSaleAtEvent } from "../sale-actions";

type EventProduct = {
  productId: string;
  product: { name: string; priceCents: number; stockQuantity: number };
};

export default function EventQuickSaleForm({
  eventId,
  products,
  currency,
}: {
  eventId: string;
  products: EventProduct[];
  currency: string;
}) {
  return (
    <form action={quickSaleAtEvent} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold">Quick sale (cash)</h2>
      <input type="hidden" name="eventId" value={eventId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Product</span>
        <select
          name="productId"
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        >
          {products.map((ep) => (
            <option key={ep.productId} value={ep.productId}>
              {ep.product.name} · stock {ep.product.stockQuantity} ·{" "}
              {formatMoney(ep.product.priceCents, currency)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Qty</span>
        <input
          name="qty"
          type="number"
          min={1}
          defaultValue={1}
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Customer name (optional)</span>
        <input
          name="customerName"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email (optional)</span>
        <input
          name="email"
          type="email"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <button type="submit" className={dashCtaClass}>
        Record cash sale
      </button>
    </form>
  );
}
