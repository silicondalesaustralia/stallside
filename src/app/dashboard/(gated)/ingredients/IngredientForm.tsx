import { MEASURE_UNITS, unitLabel } from "@/lib/production/units";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export type IngredientFormDefaults = {
  id?: string;
  name: string;
  baseUnit: string;
  purchaseQuantity: string;
  purchaseUnit: string;
  purchasePrice: string;
  supplier: string | null;
  isActive?: boolean;
};

export default function IngredientForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: IngredientFormDefaults;
}) {
  const units = MEASURE_UNITS.map((u) => (
    <option key={u} value={u}>
      {unitLabel(u)}
    </option>
  ));

  return (
    <form action={action} className="dash-card flex flex-col gap-4 p-5">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          defaultValue={defaults?.name ?? ""}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Base unit (recipes)</span>
        <select
          name="baseUnit"
          defaultValue={defaults?.baseUnit ?? "G"}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        >
          {units}
        </select>
      </label>
      <p className="text-xs text-[var(--muted)]">I buy</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Quantity</span>
          <input
            name="purchaseQuantity"
            required
            inputMode="decimal"
            defaultValue={defaults?.purchaseQuantity ?? "1"}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Unit</span>
          <select
            name="purchaseUnit"
            defaultValue={defaults?.purchaseUnit ?? "KG"}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          >
            {units}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">For ($)</span>
        <input
          name="purchasePrice"
          required
          inputMode="decimal"
          defaultValue={defaults?.purchasePrice ?? ""}
          placeholder="24.90"
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Supplier (optional)</span>
        <input
          name="supplier"
          defaultValue={defaults?.supplier ?? ""}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      {defaults?.id ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaults.isActive !== false}
          />
          Active
        </label>
      ) : null}
      <button type="submit" className={dashCtaClass}>
        Save
      </button>
    </form>
  );
}
