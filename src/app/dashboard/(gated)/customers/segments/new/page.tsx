import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createCustomSegment } from "../actions";

export default function NewSegmentPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/customers/segments" className="underline">
            Segments
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Custom segment
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Simple rules — start with order count or days since last order.
        </p>
      </div>

      <form
        action={createCustomSegment}
        className="dash-card flex flex-col gap-4 p-5"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input
            name="name"
            required
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Description (optional)</span>
          <input
            name="description"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Minimum orders</span>
          <input
            name="minOrders"
            type="number"
            min={0}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Days since last order (min)</span>
          <input
            name="daysSinceLastOrderMin"
            type="number"
            min={0}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="marketingConsent" defaultChecked />
          Marketing consent only
        </label>
        <button type="submit" className={dashCtaClass}>
          Create segment
        </button>
      </form>
    </main>
  );
}
