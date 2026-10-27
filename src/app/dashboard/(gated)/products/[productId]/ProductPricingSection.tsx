import DashFormSection from "@/components/DashFormSection";
import ProductOwnerMetaFields from "../ProductOwnerMetaFields";
import ProductPriceTiersFields from "./ProductPriceTiersFields";
import type { ProductFields } from "./product-edit-fields";

/** Price, cost/SKU/barcode and volume prices. */
export default function ProductPricingSection({ product }: { product: ProductFields }) {
  return (
    <DashFormSection title="Pricing">
      <label className="flex max-w-xs flex-col gap-2 text-sm">
        <span className="font-medium">Price ({product.currency})</span>
        <input
          name="price"
          required
          inputMode="decimal"
          defaultValue={(product.priceCents / 100).toFixed(2)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex max-w-xs flex-col gap-2 text-sm">
        <span className="font-medium">Was price ({product.currency}, optional)</span>
        <input
          name="compareAtPrice"
          inputMode="decimal"
          placeholder="e.g. 8.00"
          defaultValue={product.compareAtPriceCents != null ? (product.compareAtPriceCents / 100).toFixed(2) : ""}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <span className="text-xs text-[var(--muted)]">
          Put it on sale: enter the old price here. Your site shows it crossed out with a Sale badge. Customers pay
          the Price above. Leave blank to end the sale.
        </span>
      </label>
      <ProductOwnerMetaFields
        currency={product.currency}
        sku={product.sku}
        upc={product.upc}
        costCents={product.costCents}
        priceCents={product.priceCents}
        tax={product.tax}
        recipeCost={product.recipeCost}
      />
      <ProductPriceTiersFields currency={product.currency} initial={product.priceTiers} disabled={product.hasOptions} />
    </DashFormSection>
  );
}
