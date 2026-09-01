import Link from "next/link";
import {
  FULFILMENT_INTENTS,
  defaultFulfilmentIntents,
  normalizeBusinessMode,
} from "@/lib/business-mode";
import { requireOwner } from "@/lib/session";
import { saveSetupFulfilment } from "../actions";

export default async function SetupFulfilmentPage() {
  const { owner } = await requireOwner();
  const mode = normalizeBusinessMode(owner.businessMode);
  const defaults = new Set(
    owner.fulfilmentIntents.length > 0
      ? owner.fulfilmentIntents
      : defaultFulfilmentIntents(mode),
  );

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Getting started
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          How will you fulfil orders?
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pick what you offer. Change anytime.
        </p>
      </div>
      <form action={saveSetupFulfilment} className="flex flex-col gap-3">
        {FULFILMENT_INTENTS.map((f) => (
          <label
            key={f.id}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-sm has-[:checked]:border-[var(--leaf)]"
          >
            <input
              type="checkbox"
              name="fulfilmentIntents"
              value={f.id}
              defaultChecked={defaults.has(f.id)}
              className="size-4"
            />
            {f.label}
          </label>
        ))}
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
