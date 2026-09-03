import { dashCtaClass } from "@/components/DashPrimaryCta";
import { convertRequestToOrder } from "../../convert-actions";

type ProductOpt = {
  id: string;
  name: string;
  stockQuantity: number;
};

export default function ConvertRequestForm({
  requestId,
  standId,
  products,
}: {
  requestId: string;
  standId: string;
  products: ProductOpt[];
}) {
  return (
    <form action={convertRequestToOrder} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold">Convert to order</h2>
      <p className="text-sm text-[var(--muted)]">
        Creates a cash order (customer confirmed), decrements stock once, and
        puts it on the pack board.
      </p>
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="standId" value={standId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Product</span>
        <select
          name="productId"
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (stock {p.stockQuantity})
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
      <button type="submit" className={dashCtaClass}>
        Convert to order
      </button>
    </form>
  );
}
