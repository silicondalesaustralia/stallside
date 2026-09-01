import Link from "next/link";
import { SELL_CATEGORIES } from "@/lib/business-mode";
import { requireOwner } from "@/lib/session";
import { saveSetupSellCategories } from "../actions";

export default async function SetupSellPage() {
  const { owner } = await requireOwner();
  const selected = new Set(owner.sellCategories);

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Getting started
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          What do you sell?
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Optional — personalises tips. Never locks what you can list.
        </p>
      </div>
      <form action={saveSetupSellCategories} className="flex flex-col gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {SELL_CATEGORIES.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-sm has-[:checked]:border-[var(--leaf)]"
            >
              <input
                type="checkbox"
                name="sellCategories"
                value={c.id}
                defaultChecked={selected.has(c.id)}
                className="size-4"
              />
              {c.label}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Save
        </button>
      </form>
      <Link
        href="/dashboard/getting-started"
        className="text-sm font-semibold text-[var(--muted)] underline"
      >
        Back to checklist
      </Link>
    </main>
  );
}
