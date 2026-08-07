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
    <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-6">
      <h3 className="text-base font-semibold">Sell more</h3>
      <input type="hidden" name="includeConversion" value="1" />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Cart upsell product</span>
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
        <span className="font-medium">Upsell price override (optional)</span>
        <input
          name="upsellPrice"
          inputMode="decimal"
          defaultValue={upsellPriceDefault}
          placeholder="Leave blank for normal price"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="firstOrderDiscountEnabled"
          defaultChecked={values.firstOrderDiscountEnabled}
          className="size-4"
        />
        First-order discount (comes from your proceeds)
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">First-order percent</span>
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
          Or fixed amount ({currency}) — wins over percent if set
        </span>
        <input
          name="firstOrderDiscountAmount"
          inputMode="decimal"
          defaultValue={amountDefault}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
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
  );
}
