import { createSignupCoupon } from "@/app/admin/billing/actions";

export default function AdminCouponForm({ disabled }: { disabled: boolean }) {
  return (
    <form action={createSignupCoupon} className="grid gap-3 text-sm">
      <label className="grid gap-1">
        Code
        <input
          name="code"
          required
          placeholder="PILOT2026"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 uppercase"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          Percent off
          <input
            name="percentOff"
            type="number"
            min={0}
            max={100}
            placeholder="100"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-1">
          Or amount off (AUD)
          <input
            name="amountOff"
            type="number"
            min={0}
            step="0.01"
            placeholder="6.99"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
      </div>
      <label className="grid gap-1">
        Duration
        <select
          name="duration"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          defaultValue="once"
        >
          <option value="once">Once</option>
          <option value="repeating">Repeating (months)</option>
          <option value="forever">Forever</option>
        </select>
      </label>
      <label className="grid gap-1">
        Months (if repeating)
        <input
          name="months"
          type="number"
          min={1}
          defaultValue={1}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        Create promotion code
      </button>
    </form>
  );
}
