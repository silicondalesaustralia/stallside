import Link from "next/link";
import { money } from "@/lib/production/format";
import type { ProductLink } from "@/lib/production/load-product-links";
import { formatQuantity } from "@/lib/production/unit-convert";
import ActionForm from "../../ActionForm";
import UnitSelect from "../../UnitSelect";
import { hintClass, inputClass, labelClass } from "../../form-styles";
import { addProductPackaging, removeProductPackaging, saveOtherPackaging } from "../packaging-actions";

export default function ProductPackaging({
  link,
  materials,
}: {
  link: ProductLink;
  materials: { id: string; name: string }[];
}) {
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg bg-[var(--wash)] p-3">
      <p className="text-sm font-semibold">
        Packaging per product · <span className="font-receipt">{money(link.packagingUnitCents, link.currency)}</span>
      </p>
      {link.packagingLines.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {link.packagingLines.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2">
              <span>
                {formatQuantity(p.quantity, p.unit)} × {p.name}
              </span>
              <ActionForm action={removeProductPackaging} submitLabel="Remove" variant="danger" className="inline-flex">
                <input type="hidden" name="id" value={p.id} />
              </ActionForm>
            </li>
          ))}
        </ul>
      ) : null}

      {materials.length > 0 ? (
        <ActionForm action={addProductPackaging} submitLabel="Add packaging" variant="secondary" resetOnSuccess className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="productId" value={link.productId} />
          <label className={`${labelClass} min-w-[10rem] flex-1`}>
            Material
            <select name="ingredientId" required defaultValue="" className={inputClass}>
              <option value="" disabled>Choose packaging…</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} w-24`}>
            Per product
            <input name="quantity" type="number" step="any" min="0" required defaultValue="1" className={inputClass} />
          </label>
          <label className={`${labelClass} w-24`}>
            Unit
            <UnitSelect name="unit" label="Unit" defaultValue="EACH" />
          </label>
        </ActionForm>
      ) : (
        <p className={hintClass}>
          Add bags, boxes or labels as{" "}
          <Link href="/dashboard/production/materials?tab=packaging" className="underline">packaging materials</Link>{" "}
          to track their stock and cost here.
        </p>
      )}

      <ActionForm action={saveOtherPackaging} submitLabel="Save" variant="secondary" className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="productId" value={link.productId} />
        <label className={`${labelClass} w-40`}>
          Other packaging ($/unit)
          <input
            name="packaging"
            type="number"
            step="0.01"
            min="0"
            defaultValue={link.packagingCostCents != null ? (link.packagingCostCents / 100).toFixed(2) : ""}
            className={inputClass}
          />
        </label>
      </ActionForm>
    </div>
  );
}
