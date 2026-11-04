import type { RecipeCost } from "@/lib/production/batch-costing";
import { type MakersLpCostingRecipe } from "@/lib/makers-lp-costing-demo";
import { formatAud } from "@/lib/makers-lp-costing-fees";

const INPUT =
  "mt-1 w-full rounded-md border border-[var(--line)] bg-white px-2 py-1 tabular-nums focus:border-[var(--leaf)] focus:outline-none";

type Field = { key: keyof Omit<MakersLpCostingRecipe, "lines">; label: string; cents?: boolean };

const FIELDS: Field[] = [
  { key: "yieldQuantity", label: "Batch makes" },
  { key: "wastePercent", label: "Waste %" },
  { key: "labourMinutes", label: "Labour (min)" },
  { key: "labourRateCents", label: "Hourly rate ($)", cents: true },
  { key: "overheadCents", label: "Overhead ($)", cents: true },
];

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${strong ? "font-semibold text-[var(--field)]" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

type Props = {
  recipe: MakersLpCostingRecipe;
  cost: RecipeCost;
  yieldLabel: string;
  packagingCents: number;
  unitsPerProduct: number;
  unitCostCents: number;
  onChange: (key: Field["key"], value: number) => void;
};

export default function MakersLpCostingBatch({ recipe, cost, yieldLabel, packagingCents, unitsPerProduct, unitCostCents, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)] sm:grid-cols-5">
        {FIELDS.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              type="number"
              min="0"
              step="any"
              defaultValue={field.cents ? recipe[field.key] / 100 : recipe[field.key]}
              onChange={(e) => {
                const n = Number(e.target.value);
                const value = Number.isFinite(n) && n >= 0 ? n : 0;
                onChange(field.key, field.cents ? Math.round(value * 100) : value);
              }}
              className={INPUT}
            />
          </label>
        ))}
      </div>
      <div className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm">
        <Row label="Materials (incl. waste)" value={formatAud(cost.materialCents)} />
        <Row label="Labour" value={formatAud(cost.labourCents)} />
        <Row label="Overhead" value={formatAud(cost.overheadCents)} />
        <Row label="Batch total" value={formatAud(cost.totalCents)} strong />
        <Row
          label={`${unitsPerProduct} of ${recipe.yieldQuantity} ${yieldLabel} + packaging (${formatAud(packagingCents)})`}
          value={formatAud(unitCostCents)}
          strong
        />
      </div>
    </div>
  );
}
