import {
  CONFIRM_LIFETIME_FIELD,
  CONFIRM_PRICING_FIELD,
  type PricingMoveNotice,
} from "@/lib/pricing-move-gate";

export default function PricingMoveConfirm({
  notice,
  actionLabel,
}: {
  notice: PricingMoveNotice;
  /** e.g. "Upgrading to Pro" or "Connecting Square" */
  actionLabel: string;
}) {
  if (notice === "none") return null;

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
      <p className="font-semibold text-[var(--ink)]">
        {actionLabel} moves your account to current pricing
      </p>
      <ul className="list-inside list-disc space-y-1 text-[var(--muted)]">
        <li>Free plan: 2.5% + 30c per Stripe card sale; 2.5% on Square and PayPal.</li>
        <li>
          Pro: no Vendl fee on the first A$4,000 of Stripe sales each month, then
          0.5%. No Vendl fee on Square or PayPal.
        </li>
        <li>Stripe payouts move to a weekly schedule (Mondays).</li>
        <li>This change is permanent, even if you later cancel or disconnect.</li>
      </ul>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name={CONFIRM_PRICING_FIELD}
          value="1"
          required
          className="mt-0.5"
        />
        <span>I understand and accept the current pricing.</span>
      </label>
      {notice === "lifetime" ? (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          <p className="font-semibold">This ends your Lifetime plan.</p>
          <p>
            You&apos;ll move to the Free plan with the fees above, or you can
            subscribe to Pro. Lifetime access cannot be restored.
          </p>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name={CONFIRM_LIFETIME_FIELD}
              value="1"
              required
              className="mt-0.5"
            />
            <span>I understand this permanently ends my Lifetime plan.</span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
