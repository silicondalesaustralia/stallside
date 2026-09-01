import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { saveSetupBranding } from "../actions";

export default async function SetupBrandingPage() {
  const { owner } = await requireOwner();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Getting started
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Brand colours
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Applied to your public shop or stand. Refine later anytime.
        </p>
      </div>
      <form action={saveSetupBranding} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Primary colour</span>
          <input
            type="color"
            name="brandAccentColor"
            defaultValue={owner.brandAccentColor ?? "#2e7d3f"}
            className="h-12 w-full cursor-pointer rounded-[var(--radius)] border border-[var(--line)] bg-white"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Accent colour</span>
          <input
            type="color"
            name="brandSecondaryColor"
            defaultValue={owner.brandSecondaryColor ?? "#f5a623"}
            className="h-12 w-full cursor-pointer rounded-[var(--radius)] border border-[var(--line)] bg-white"
          />
        </label>
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
