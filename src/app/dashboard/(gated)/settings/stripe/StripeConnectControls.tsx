import StripeDisconnectButton from "./StripeDisconnectButton";
import { refreshStripeStatus, startStripeConnect } from "./actions";

export default function StripeConnectControls({
  configured,
  ready,
  started,
}: {
  configured: boolean;
  ready: boolean;
  started: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <form action={startStripeConnect}>
        <button
          type="submit"
          disabled={!configured}
          className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {ready
            ? "Open Stripe dashboard link"
            : started
              ? "Continue Stripe setup"
              : "Connect Stripe"}
        </button>
      </form>
      {started ? (
        <form action={refreshStripeStatus}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold"
          >
            Refresh status
          </button>
        </form>
      ) : null}
      {started ? <StripeDisconnectButton /> : null}
    </div>
  );
}
