import UnitSelect from "../UnitSelect";
import { hintClass, inputClass, labelClass } from "../form-styles";

export default function PurchaseFields({
  materials,
  today,
}: {
  materials: { id: string; name: string }[];
  today: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {materials.length === 1 ? (
        <input type="hidden" name="ingredientId" value={materials[0].id} />
      ) : (
        <label className={labelClass}>
          Material
          <select name="ingredientId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className={labelClass}>
        Quantity received
        <div className="grid grid-cols-[1fr_6rem] gap-2">
          <input name="quantity" type="number" step="any" min="0" required aria-label="Quantity" className={inputClass} />
          <UnitSelect name="unit" label="Unit" defaultValue="KG" />
        </div>
      </div>
      <label className={labelClass}>
        Total paid ($)
        <input name="total" type="number" step="0.01" min="0" required className={inputClass} />
        <span className={hintClass}>Include delivery if you want it in your costs.</span>
      </label>
      <label className={labelClass}>
        Supplier
        <input name="supplier" className={inputClass} />
      </label>
      <label className={labelClass}>
        Received
        <input name="receivedAt" type="date" defaultValue={today} className={inputClass} />
      </label>
      <label className={labelClass}>
        Lot / batch code
        <input name="lotCode" className={inputClass} />
        <span className={hintClass}>From the supplier label, for traceability.</span>
      </label>
      <label className={labelClass}>
        Use by / expiry
        <input name="expiresAt" type="date" className={inputClass} />
      </label>
      <label className={labelClass}>
        Notes
        <input name="notes" className={inputClass} />
      </label>
    </div>
  );
}
