import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { isPayPalConfigured } from "@/lib/paypal";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { syncPayPalMerchantStatus } from "@/lib/paypal-sync";
import {
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
  }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });

  if (
    cardTier &&
    isPayPalConfigured() &&
    (params.return === "1" || params.merchantIdInPayPal)
  ) {
    await syncPayPalMerchantStatus({
      ownerId: owner.id,
      trackingId: owner.id,
      existingMerchantId: owner.paypalMerchantId,
      existingPaymentsEnabled: owner.paypalPaymentsEnabled,
      merchantIdHint: params.merchantIdInPayPal ?? null,
    });
    redirect("/dashboard/settings/paypal");
  }

  const configured = isPayPalConfigured();
  const connected = Boolean(owner.paypalMerchantId);
  const ready = owner.paypalOnboardingComplete;

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
          Connect your PayPal Business account so customers can pay with PayPal
          after they scan your Stallside QR. Funds go to you — Stallside is not
          in the funds flow.
        </p>
      </div>

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
          to <code className="rounded bg-black/5 px-1">.env</code> to enable
          Connect.
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
            {connected ? "Continue PayPal setup" : "Connect PayPal"}
          </button>
        </form>
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
            Independent of card. Customers see PayPal only when this is on.
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
