import { dashCtaClass } from "@/components/DashPrimaryCta";
import { addEventProduct } from "../actions";

export default function EventAddProductForm({
  eventId,
  catalogue,
}: {
  eventId: string;
  catalogue: { id: string; name: string }[];
}) {
  return (
    <form action={addEventProduct} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold">Add product</h2>
      <input type="hidden" name="eventId" value={eventId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Product</span>
        <select
          name="productId"
          required
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        >
          {catalogue.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Allocated qty (soft)</span>
        <input
          name="allocatedQty"
          type="number"
          min={0}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <button type="submit" className={dashCtaClass}>
        Add / update
      </button>
    </form>
  );
}
