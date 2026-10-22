import Link from "next/link";
import { productUnitCostCents } from "@/lib/production/batch-costing";
import { money } from "@/lib/production/format";
import type { ProductLink } from "@/lib/production/load-product-links";
import ActionForm from "../../ActionForm";
import { cardClass, hintClass, inputClass, labelClass } from "../../form-styles";
import { linkProduct, unlinkProduct } from "../recipe-line-actions";
import PricingCalculator from "./PricingCalculator";

export default function LinkedProducts({
  recipe,
  batchTotalCents,
  links,
  linkable,
}: {
  recipe: { id: string; yieldQuantity: number; yieldLabel: string };
  batchTotalCents: number;
  links: ProductLink[];
  linkable: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {links.map((l) => {
        const unitCost = productUnitCostCents({
          batchTotalCents,
          yieldQuantity: recipe.yieldQuantity,
          yieldUnitsPerProduct: l.yieldUnitsPerProduct,
          packagingCostCents: l.packagingCostCents,
        });
        return (
          <section key={l.productId} className={cardClass}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/dashboard/products/${l.productId}`} className="font-semibold underline">
                  {l.productName}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {l.yieldUnitsPerProduct} {recipe.yieldLabel} per product · packaging{" "}
                  {money(l.packagingCostCents ?? 0, l.currency)} · {l.stockQuantity} in stock
                </p>
              </div>
              <ActionForm action={unlinkProduct} submitLabel="Unlink" variant="danger" className="inline-flex">
                <input type="hidden" name="productId" value={l.productId} />
              </ActionForm>
            </div>
            <PricingCalculator unitCostCents={unitCost} priceCents={l.priceCents} currency={l.currency} />
          </section>
        );
      })}

      {linkable.length > 0 ? (
        <ActionForm action={linkProduct} submitLabel="Link product" variant="secondary" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="recipeId" value={recipe.id} />
          <label className={`${labelClass} min-w-[12rem] flex-1`}>
            Product made from this recipe
            <select name="productId" required defaultValue="" className={inputClass}>
              <option value="" disabled>Choose…</option>
              {linkable.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} w-36`}>
            {recipe.yieldLabel} per product
            <input name="yieldUnitsPerProduct" type="number" step="any" min="0" required defaultValue="1" className={inputClass} />
          </label>
          <label className={`${labelClass} w-36`}>
            Packaging ($/unit)
            <input name="packaging" type="number" step="0.01" min="0" className={inputClass} />
          </label>
          <p className={`${hintClass} w-full`}>
            e.g. the recipe makes 12 cookies and the product is a box of 6, so enter 6.
          </p>
        </ActionForm>
      ) : null}
    </div>
  );
}
