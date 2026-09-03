import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createPromotion } from "../actions";

export default function NewCouponPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/coupons" className="underline">
            Coupons
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          New coupon
        </h1>
      </div>

      <form action={createPromotion} className="dash-card flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Code</span>
          <input
            name="code"
            required
            placeholder="WEEKEND10"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 uppercase"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input
            name="name"
            placeholder="Weekend special"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Type</span>
          <select
            name="type"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            defaultValue="PERCENT_OFF"
          >
            <option value="PERCENT_OFF">Percent off</option>
            <option value="FIXED_OFF">Fixed amount off</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Percent off</span>
          <input
            name="percentOff"
            type="number"
            min={1}
            max={100}
            defaultValue={10}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Fixed amount off ($)</span>
          <input
            name="amountOff"
            type="number"
            min={0}
            step="0.01"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Minimum order ($)</span>
          <input
            name="minOrder"
            type="number"
            min={0}
            step="0.01"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Starts</span>
            <input
              name="startsAt"
              type="datetime-local"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Ends</span>
            <input
              name="endsAt"
              type="datetime-local"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Usage limit (optional)</span>
          <input
            name="usageLimit"
            type="number"
            min={1}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="firstOrderOnly" />
          First order only
        </label>
        <button type="submit" className={dashCtaClass}>
          Create coupon
        </button>
      </form>
    </main>
  );
}
