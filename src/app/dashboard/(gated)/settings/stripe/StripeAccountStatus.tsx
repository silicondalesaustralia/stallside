import StripeConnectControls from "./StripeConnectControls";

export default function StripeAccountStatus({
  accountId,
  chargesEnabled,
  payoutsEnabled,
  billingRegion,
  configured,
  started,
}: {
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  billingRegion: string;
  configured: boolean;
  started: boolean;
}) {
  const status = !started
    ? "Not connected"
    : chargesEnabled
      ? "Connected"
      : "Finish setup";

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <div className="space-y-1">
        <p>
          Status: <strong>{status}</strong>
          {started ? (
            <>
              {" "}
              · Charges {chargesEnabled ? "on" : "off"} · Payouts{" "}
              {payoutsEnabled ? "on" : "off"}
            </>
          ) : null}
        </p>
        <p className="text-[var(--muted)]">
          Billing region: {billingRegion}
          {accountId ? (
            <>
              {" "}
              · Account <code className="text-xs">{accountId}</code>
            </>
          ) : null}
        </p>
      </div>
      <StripeConnectControls
        configured={configured}
        ready={chargesEnabled}
        started={started}
      />
    </section>
  );
}
