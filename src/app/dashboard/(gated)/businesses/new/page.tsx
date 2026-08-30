import { CURRENCIES } from "@/lib/constants";
import { DEFAULT_TIMEZONE, STAND_TIMEZONES } from "@/lib/stand-timezone";
import { createStand } from "../actions";
import FormField from "@/components/FormField";

export default function NewStandPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">New Business</h1>
      <p className="mt-2 text-[var(--muted)]">
        Give it a name and go live — add products, pre-orders, and payments anytime.
      </p>
      <form action={createStand} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="intent" value="create" />
        <FormField
          label="Business name"
          name="name"
          required
          placeholder="Green Valley Eggs"
        />
        <FormField
          label="Suburb / location"
          name="locationLabel"
          placeholder="Woodend"
        />
        <FormField
          label="Instructions"
          name="description"
          placeholder="Please take eggs from the fridge…"
        />
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Currency</span>
          <select
            name="currency"
            defaultValue="AUD"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Timezone</span>
          <select
            name="timezone"
            defaultValue={DEFAULT_TIMEZONE}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {STAND_TIMEZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
          <span className="text-[var(--muted)]">
            Used for pre-order order-by and collection times.
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showExactStock" className="size-4" />
          Show exact stock counts on public checkout
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Create Business
        </button>
      </form>
    </main>
  );
}
