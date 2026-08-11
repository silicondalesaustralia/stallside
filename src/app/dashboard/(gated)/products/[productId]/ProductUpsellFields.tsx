type ProductOpt = { id: string; name: string; priceCents: number };

/** Take-now cart upsell only (pre-order add-ons live on pre-order pages). */
export default function ProductUpsellFields({
  currency,
  products,
  upsellProductId,
  upsellPriceCents,
  businessId,
}: {
  currency: string;
  products: ProductOpt[];
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  businessId: string;
}) {
  const priceDefault =
    upsellPriceCents != null ? (upsellPriceCents / 100).toFixed(2) : "";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <div>
        <h3 className="text-base font-semibold">Cart upsell (take-now)</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          When this product is in a take-now cart, offer one extra item. Overrides
          the{" "}
          <a
            href={`/dashboard/businesses/${businessId}?tab=upsells`}
            className="text-[var(--leaf-dark)] underline"
          >
            business Upsells
          </a>{" "}
          default. Pre-order add-ons are set on each{" "}
          <a
            href="/dashboard/pre-order-pages"
            className="text-[var(--leaf-dark)] underline"
          >
            pre-order page
          </a>
          .
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product to offer</span>
        <select
          name="upsellProductId"
          defaultValue={upsellProductId ?? ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          <option value="">None (use business default)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Special upsell price (optional)</span>
        <input
          name="upsellPrice"
          inputMode="decimal"
          defaultValue={priceDefault}
          placeholder={`Leave blank for normal ${currency} price`}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
    </div>
  );
}
