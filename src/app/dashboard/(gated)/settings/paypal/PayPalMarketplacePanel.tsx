import {
  connectPayPalDirect,
  refreshPayPalStatus,
  startPayPalConnect,
} from "./actions";

export default function PayPalMarketplacePanel({
  configured,
  connected,
  canDirect,
  partner,
  connectedDirect,
}: {
  configured: boolean;
  connected: boolean;
  canDirect: boolean;
  partner: string | undefined;
  connectedDirect: boolean;
}) {
  return (
    <>
      {partner === "denied" || partner === "direct" ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          {partner === "denied"
            ? "PayPal Partner Referrals is not enabled on this app yet (403 NOT_AUTHORIZED). Marketplace owner-onboarding needs PayPal partner approval."
            : "Marketplace Connect is disabled (PAYPAL_CONNECT_MODE=direct)."}
        </p>
      ) : null}

      {partner === "error" ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          PayPal Connect hit an error. Check live credentials and try again.
        </p>
      ) : null}

      {connectedDirect ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
          Linked to the platform PayPal Business account for live testing.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <form action={startPayPalConnect}>
          <button
            type="submit"
            disabled={!configured}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            {connected ? "Continue marketplace Connect" : "Connect PayPal (marketplace)"}
          </button>
        </form>
        {canDirect ? (
          <form action={connectPayPalDirect}>
            <button
              type="submit"
              disabled={!configured}
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Use platform PayPal (direct test)
            </button>
          </form>
        ) : null}
        {connected ? (
          <form action={refreshPayPalStatus}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold"
            >
              Refresh status
            </button>
          </form>
        ) : null}
      </div>
    </>
  );
}
