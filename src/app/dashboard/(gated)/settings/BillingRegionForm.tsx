import { BILLING_REGIONS } from "@/lib/saas-pricing";
import { updateBillingRegionAction } from "./billing-region-actions";

export default function BillingRegionForm({
  billingCurrency,
  stripeConnected,
}: {
  billingCurrency: string;
  stripeConnected: boolean;
}) {
  const current = (billingCurrency || "AUD").toUpperCase();

  return (
    <form action={updateBillingRegionAction} className="space-y-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Billing region</span>
        <select
          name="billingCurrency"
          defaultValue={current}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        >
          {BILLING_REGIONS.map((r) => (
            <option key={r.currency} value={r.currency}>
              {r.label} ({r.currency})
              {r.currency === "AUD" ? " · Stripe or Square" : " · Stripe"}
            </option>
          ))}
        </select>
      </label>
      {stripeConnected ? (
        <p className="text-[var(--muted)]">
          You already started Stripe Connect. Changing region does not move your
          Stripe account country — contact support if you need a different
          Connect country.
        </p>
      ) : null}
      <button
        type="submit"
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--wash)]"
      >
        Save region
      </button>
    </form>
  );
}
