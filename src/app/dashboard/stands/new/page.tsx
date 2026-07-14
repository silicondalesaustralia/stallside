import { CURRENCIES } from "@/lib/constants";
import { createStand } from "../actions";
import FormField from "@/components/FormField";

export default function NewStandPage() {
  return (
    <main className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">New stand</h1>
      <p className="mt-2 text-[var(--muted)]">Name it the way customers will recognise it.</p>
      <form action={createStand} className="mt-8 flex flex-col gap-4">
        <FormField label="Stand name" name="name" required placeholder="Green Valley Eggs" />
        <FormField
          label="Instructions"
          name="description"
          placeholder="Please take eggs from the fridge…"
        />
        <FormField label="Location label" name="locationLabel" placeholder="Gate on Miller Rd" />
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showExactStock" className="size-4" />
          Show exact stock counts on public checkout
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Create stand
        </button>
      </form>
    </main>
  );
}
