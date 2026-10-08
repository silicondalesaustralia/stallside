import {
  BILLING_REGIONS,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import { updateBillingRegion } from "./region-actions";

const ERRORS: Record<string, string> = {
  region_invalid: "Pick a billing region from the list.",
  region_locked:
    "Billing region is locked once Stripe payouts or a paid plan are set up. Contact support to change it.",
  region_failed: "Could not save billing region. Try again.",
  region_square:
    "Your Square account is tied to its country. Disconnect Square first, then change region.",
};

export default function BillingRegionForm({
  billingCurrency,
  locked,
  error,
  saved,
}: {
  billingCurrency: BillingCurrency;
  locked: boolean;
  error?: string;
  saved: boolean;
}) {
  const message = error ? ERRORS[error] : undefined;

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold">Change billing region</p>
      {locked ? (
        <p className="text-[var(--muted)]">{ERRORS.region_locked}</p>
      ) : (
        <form action={updateBillingRegion} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-medium text-[var(--ink)]">Region</span>
            <select
              name="currency"
              defaultValue={billingCurrency}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              {BILLING_REGIONS.map((r) => (
                <option key={r.currency} value={r.currency}>
                  {r.label} ({r.currency})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 font-semibold"
          >
            Save region
          </button>
        </form>
      )}
      {!locked ? (
        <p className="text-[var(--muted)]">
          Sets your Pro price currency and the country used when you connect
          Stripe payouts. Square needs a Square account in the same country.
        </p>
      ) : null}
      {saved ? <p className="text-[var(--leaf)]">Billing region saved.</p> : null}
      {message && !locked ? <p className="text-red-700">{message}</p> : null}
    </section>
  );
}
