import { CURRENCIES } from "@/lib/constants";
import { listPreOrderVerticals } from "@/lib/verticals";
import { createStand } from "../actions";
import FormField from "@/components/FormField";

export default function NewStandPage() {
  const verticals = listPreOrderVerticals();

  return (
    <main className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">New Business</h1>
      <p className="mt-2 text-[var(--muted)]">
        Choose stall checkout or pre-orders, give it a name, and go live.
      </p>
      <form action={createStand} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="intent" value="create" />
        <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4">
          <legend className="px-1 text-sm font-medium">What are you setting up?</legend>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="verticalSlug"
              value=""
              defaultChecked
              className="mt-0.5 size-4 accent-[var(--leaf)]"
            />
            <span>
              <span className="font-medium">Stall</span>
              <span className="mt-0.5 block text-[var(--muted)]">
                Unattended QR checkout for what&apos;s on the shelf now. You add
                your own products.
              </span>
            </span>
          </label>
          {verticals.map((v) => (
            <label key={v.slug} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="verticalSlug"
                value={v.slug}
                className="mt-0.5 size-4 accent-[var(--leaf)]"
              />
              <span>
                <span className="font-medium">{v.displayName}</span>
                <span className="mt-0.5 block text-[var(--muted)]">
                  Pre-orders - customers order and pay ahead of collection or
                  delivery.
                </span>
              </span>
            </label>
          ))}
        </fieldset>
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
