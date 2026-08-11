type ProductOpt = { id: string; name: string; priceCents: number };

export type StandConversionValues = {
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  firstOrderDiscountEnabled: boolean;
  firstOrderDiscountPercent: number;
  firstOrderDiscountAmountCents: number | null;
  showPublicScarcity: boolean;
};

export default function StandConversionFields({
  currency,
  products,
  values,
}: {
  currency: string;
  products: ProductOpt[];
  values: StandConversionValues;
}) {
  const upsellPriceDefault =
    values.upsellPriceCents != null
      ? (values.upsellPriceCents / 100).toFixed(2)
      : "";
  const amountDefault =
    values.firstOrderDiscountAmountCents != null
      ? (values.firstOrderDiscountAmountCents / 100).toFixed(2)
      : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-base font-semibold">Stall cart upsell</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            For take-now carts: offer one extra catalogue product. Leave blank
            to set per product instead.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Product to offer</span>
          <select
            name="upsellProductId"
            defaultValue={values.upsellProductId ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">None</option>
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
            defaultValue={upsellPriceDefault}
            placeholder={`Leave blank for normal ${currency} price`}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">First-order discount</h3>
            <span className="relative inline-flex">
              <button
                type="button"
                className="peer flex size-5 items-center justify-center rounded-full border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:border-[var(--leaf)] hover:text-[var(--field)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]"
                aria-label="How first-order discount works"
              >
                ?
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-72 rounded-lg border border-[var(--line)] bg-white p-3 text-left text-xs leading-relaxed text-[var(--muted)] shadow-md peer-hover:block peer-focus:block peer-focus-visible:block"
              >
                Customers enter an email at checkout. We check whether that
                email already has a paid or confirmed order at this business.
                If not, the discount applies. Same email next time = no
                discount. Different email = treated as first time. No customer
                account needed.
              </span>
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Give first-time buyers a break. Comes from your proceeds, not a
            platform coupon.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="firstOrderDiscountEnabled"
            defaultChecked={values.firstOrderDiscountEnabled}
            className="size-4"
          />
          Enable first-order discount
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Percent off</span>
          <input
            name="firstOrderDiscountPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={values.firstOrderDiscountPercent}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">
            Or fixed amount ({currency}) - wins over percent if set
          </span>
          <input
            name="firstOrderDiscountAmount"
            inputMode="decimal"
            defaultValue={amountDefault}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-6">
        <h3 className="text-base font-semibold">Scarcity</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="showPublicScarcity"
            defaultChecked={values.showPublicScarcity}
            className="size-4"
          />
          Show “Only N left” when stock is low
        </label>
      </div>
    </div>
  );
}
