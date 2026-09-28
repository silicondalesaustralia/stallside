import type { StandShopLayout } from "@/generated/prisma/client";
import { setShopLayout } from "./actions";

const OPTIONS: { value: StandShopLayout; label: string; hint: string }[] = [
  {
    value: "ALL_PRODUCTS",
    label: "All products",
    hint: "Every product in one list. Categories still appear in the menu.",
  },
  {
    value: "CATEGORIES",
    label: "Categories",
    hint: "Category tiles first. Products without a category show underneath.",
  },
];

export default function ShopLayoutForm({
  standId,
  standName,
  value,
  saved,
}: {
  standId: string;
  standName: string;
  value: StandShopLayout;
  saved: boolean;
}) {
  return (
    <form
      action={setShopLayout.bind(null, standId)}
      className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white p-4"
    >
      <div>
        <p className="font-semibold">Shop page shows</p>
        <p className="text-sm text-[var(--muted)]">For {standName}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer gap-3 rounded-lg border border-[var(--line)] p-3 has-[:checked]:border-[var(--leaf)] has-[:checked]:bg-[var(--wash)]"
          >
            <input type="radio" name="shopLayout" value={o.value} defaultChecked={value === o.value} />
            <span>
              <span className="block text-sm font-semibold">{o.label}</span>
              <span className="block text-xs text-[var(--muted)]">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Save
        </button>
        {saved ? <p className="text-sm text-[var(--muted)]">Saved.</p> : null}
      </div>
    </form>
  );
}
