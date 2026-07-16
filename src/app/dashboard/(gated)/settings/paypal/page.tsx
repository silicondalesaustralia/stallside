import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import {
  isPayPalConfigured,
  isPayPalDirectMode,
  paypalDirectMerchantId,
} from "@/lib/paypal";
import {
  hasComplimentaryAccess,
  ownerHasCardTierAccess,
} from "@/lib/owner-trial";
import { syncPayPalMerchantStatus } from "@/lib/paypal-sync";
import {
  connectPayPalDirect,
  refreshPayPalStatus,
  setPayPalPaymentsEnabled,
  startPayPalConnect,
} from "./actions";
import PayPalWarnings from "./PayPalWarnings";

export default async function PayPalSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    return?: string;
    merchantIdInPayPal?: string;
    permissionsGranted?: string;
    partner?: string;
    connected?: string;
  }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const canDirect =
    isPayPalDirectMode() ||
    hasComplimentaryAccess({ email: user.email, role: user.role });
  const directMerchantId = paypalDirectMerchantId();

  if (
    cardTier &&
    isPayPalConfigured() &&
    (params.return === "1" || params.merchantIdInPayPal)
  ) {
    try {
      await syncPayPalMerchantStatus({
        ownerId: owner.id,
        trackingId: owner.id,
        existingMerchantId: owner.paypalMerchantId,
        existingPaymentsEnabled: owner.paypalPaymentsEnabled,
        merchantIdHint: params.merchantIdInPayPal ?? null,
      });
    } catch (error) {
      console.error("PayPal return sync failed", error);
    }
    redirect("/dashboard/settings/paypal");
  }

  const configured = isPayPalConfigured();
  const connected = Boolean(owner.paypalMerchantId);
  const ready = owner.paypalOnboardingComplete;
  const partnerDenied = params.partner === "denied";
  const partnerDirectHint = params.partner === "direct";
  const partnerError = params.partner === "error";
  const connectedDirect = params.connected === "direct";

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
          Connect PayPal so customers can pay after scanning your Stallside QR.
        </p>
      </div>

      {partnerDenied || partnerDirectHint ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          {partnerDenied
            ? "PayPal Partner Referrals is not enabled on this app yet (403 NOT_AUTHORIZED). Marketplace owner-onboarding needs PayPal partner approval."
            : "Marketplace Connect is disabled (PAYPAL_CONNECT_MODE=direct)."}{" "}
          Until Partner API is approved, use{" "}
          <strong>Use platform PayPal (direct test)</strong> below — funds go to
          the Stallside PayPal Business account linked in env.
        </p>
      ) : null}

      {partnerError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          PayPal Connect hit an error. Check live credentials and try again, or
          use direct platform PayPal if Partner API is not approved.
        </p>
      ) : null}

      {connectedDirect ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
          Linked to the platform PayPal Business account for live testing.
        </p>
      ) : null}

      {!cardTier ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          PayPal is on the Card plan. Your account does not have Card-tier access
          yet.
        </p>
      ) : null}

      {cardTier ? <PayPalWarnings billingCurrency={owner.billingCurrency} /> : null}

      {!configured ? (
        <p className="text-sm text-red-700">
          Add <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_ID</code>,{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_SECRET</code>,
          and{" "}
          <code className="rounded bg-black/5 px-1">
            PAYPAL_PARTNER_MERCHANT_ID
          </code>{" "}
          (live merchant id) on the server, with{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_MODE=live</code>.
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
        <p>Onboarding complete: {ready ? "Yes" : "No"}</p>
        <p>
          Offering PayPal at checkout:{" "}
          {owner.paypalPaymentsEnabled ? "On" : "Off"}
        </p>
      </section>

      {cardTier ? (
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
          {canDirect && directMerchantId ? (
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
      ) : null}

      {cardTier && connected && ready ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <p className="font-semibold">Show PayPal at checkout</p>
          <p className="text-[var(--muted)]">
            Customers see PayPal only when this is on.
          </p>
          <form action={setPayPalPaymentsEnabled}>
            <input
              type="hidden"
              name="enabled"
              value={owner.paypalPaymentsEnabled ? "0" : "1"}
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold"
            >
              {owner.paypalPaymentsEnabled
                ? "Turn PayPal off"
                : "Turn PayPal on"}
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
