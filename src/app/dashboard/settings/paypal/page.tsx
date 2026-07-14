import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { isPayPalConfigured } from "@/lib/paypal";
import { refreshPayPalStatus, startPayPalConnect } from "./actions";

export default async function PayPalSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    return?: string;
    merchantIdInPayPal?: string;
    permissionsGranted?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;

  if (params.return === "1" || params.merchantIdInPayPal) {
    await refreshPayPalStatus(params.merchantIdInPayPal ?? null);
  }

  const configured = isPayPalConfigured();

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">PayPal Connect</h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect your PayPal Business account so customers can pay with PayPal.
          Funds go to you - Stallside does not take a Connect cut in MVP.
        </p>
      </div>

      {!configured ? (
        <p className="text-sm text-red-700">
          Add <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_ID</code>,{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_SECRET</code>, and{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_PARTNER_MERCHANT_ID</code>{" "}
          to <code className="rounded bg-black/5 px-1">.env</code> to enable Connect.
        </p>
      ) : null}

      <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p>
          Merchant ID:{" "}
          {owner.paypalMerchantId ? (
            <code className="text-xs">{owner.paypalMerchantId}</code>
          ) : (
            "Not connected"
          )}
        </p>
        <p>Onboarding complete: {owner.paypalOnboardingComplete ? "Yes" : "No"}</p>
        <p>Payments enabled: {owner.paypalPaymentsEnabled ? "Yes" : "No"}</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <form action={startPayPalConnect}>
          <button
            type="submit"
            disabled={!configured}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            {owner.paypalMerchantId ? "Continue PayPal setup" : "Connect PayPal"}
          </button>
        </form>
        {owner.paypalMerchantId ? (
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
    </main>
  );
}
