export default function StripeAccountStatus({
  accountId,
  onboardingComplete,
  chargesEnabled,
  payoutsEnabled,
  billingRegion,
}: {
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  billingRegion: string;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p>
        Account:{" "}
        {accountId ? (
          <code className="text-xs">{accountId}</code>
        ) : (
          "Not connected"
        )}
      </p>
      <p>Onboarding complete: {onboardingComplete ? "Yes" : "No"}</p>
      <p>Charges enabled: {chargesEnabled ? "Yes" : "No"}</p>
      <p>Payouts enabled: {payoutsEnabled ? "Yes" : "No"}</p>
      <p>
        Billing region / Connect country: <strong>{billingRegion}</strong>
      </p>
    </section>
  );
}
