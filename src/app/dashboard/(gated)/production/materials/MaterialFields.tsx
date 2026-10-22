import type { MaterialRow } from "@/lib/production/load-cost-context";
import UnitSelect from "../UnitSelect";
import { hintClass, inputClass, labelClass } from "../form-styles";

export default function MaterialFields({ material }: { material?: MaterialRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {material ? <input type="hidden" name="id" value={material.id} /> : null}
      <label className={labelClass}>
        Name
        <input name="name" required defaultValue={material?.name} placeholder="Plain flour, PLA filament, M3 bolt" className={inputClass} />
      </label>
      <label className={labelClass}>
        Recipe unit
        <UnitSelect name="baseUnit" label="Recipe unit" defaultValue={material?.baseUnit ?? "G"} />
        <span className={hintClass}>How recipes measure it. Stock is tracked in this unit.</span>
      </label>
      <div className={labelClass}>
        Pack size and price
        <div className="grid grid-cols-[1fr_6rem_1fr] gap-2">
          <input name="purchaseQuantity" type="number" step="any" min="0" required defaultValue={material?.purchaseQuantity} placeholder="10" aria-label="Pack quantity" className={inputClass} />
          <UnitSelect name="purchaseUnit" label="Pack unit" defaultValue={material?.purchaseUnit ?? "KG"} />
          <input name="purchasePrice" type="number" step="0.01" min="0" required defaultValue={material ? (material.purchasePriceCents / 100).toFixed(2) : undefined} placeholder="$ price" aria-label="Pack price" className={inputClass} />
        </div>
        <span className={hintClass}>e.g. 10 kg for $18.50. Updated automatically when you record a purchase.</span>
      </div>
      <label className={labelClass}>
        Supplier
        <input name="supplier" defaultValue={material?.supplier ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Stock on hand
        <input name="onHand" type="number" step="any" defaultValue={material?.onHand} placeholder="0" className={inputClass} />
        <span className={hintClass}>In the recipe unit. Edit to correct it after a stock count.</span>
      </label>
      <label className={labelClass}>
        Reorder at
        <input name="reorderLevel" type="number" step="any" min="0" defaultValue={material?.reorderLevel ?? ""} className={inputClass} />
        <span className={hintClass}>Flag as low when stock falls to this amount.</span>
      </label>
      <label className={labelClass}>
        SKU / code
        <input name="sku" defaultValue={material?.sku ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Notes
        <input name="notes" defaultValue={material?.notes ?? ""} className={inputClass} />
      </label>
    </div>
  );
}
