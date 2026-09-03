import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createCustomOrderForm } from "../actions";

const FIELD_OPTS = [
  ["TEXT", "Short text"],
  ["TEXTAREA", "Long text"],
  ["NUMBER", "Number"],
  ["DATE", "Date"],
  ["SELECT", "Select"],
  ["EMAIL", "Email"],
  ["PHONE", "Phone"],
] as const;

export default function NewCustomOrderFormPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/forms" className="underline">
            Custom orders
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">New form</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Name, email and phone are always collected. Add 2–5 extra fields.
        </p>
      </div>

      <form action={createCustomOrderForm} className="dash-card flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            placeholder="Custom cake request"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Slug (optional)</span>
          <input
            name="slug"
            placeholder="custom-cake"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            name="description"
            rows={3}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>

        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="grid gap-2 border-t border-[var(--line)] pt-3 sm:grid-cols-[1fr_auto_auto]">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Field {i + 1}</span>
              <input
                name={`fieldLabel${i}`}
                required={i < 2}
                placeholder={i < 2 ? "Required" : "Optional"}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Type</span>
              <select
                name={`fieldType${i}`}
                defaultValue="TEXT"
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              >
                {FIELD_OPTS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" name={`fieldRequired${i}`} defaultChecked={i < 2} />
              Required
            </label>
          </div>
        ))}

        <button type="submit" className={dashCtaClass}>
          Create form
        </button>
      </form>
    </main>
  );
}
