import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import {
  isPayPalConfigured,
  isPayPalConnectAvailable,
  isPayPalDirectMode,
  isPayPalMarketplaceEnabled,
  paypalDirectMerchantId,
} from "@/lib/paypal";
import {
  hasComplimentaryAccess,
  ownerHasProAccess,
} from "@/lib/owner-trial";
import { syncPayPalMerchantStatus } from "@/lib/paypal-sync";
import { setPayPalPaymentsEnabled } from "./actions";
import PayPalWarnings from "./PayPalWarnings";
import PayPalMarketplacePanel from "./PayPalMarketplacePanel";
import PayPalMerchantIdForm from "./PayPalMerchantIdForm";

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
  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const canDirect =
    isPayPalDirectMode() ||
    hasComplimentaryAccess({ email: user.email, role: user.role });
  const directMerchantId = paypalDirectMerchantId();
  const marketplace = isPayPalMarketplaceEnabled();

  if (
    cardTier &&
    marketplace &&
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
  const connectAvailable = isPayPalConnectAvailable();
  const connected = Boolean(owner.paypalMerchantId);
  const ready = owner.paypalOnboardingComplete;

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/payments" className="underline">
          Payments
        </Link>
      </p>
      <div className={connectAvailable ? undefined : "opacity-55"}>
        <h1 className="text-3xl font-semibold tracking-tight">PayPal Connect</h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect PayPal so customers can pay after scanning your Vendl QR.
        </p>
      </div>

      {!connectAvailable ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          PayPal Connect is coming soon. Card / Tap &amp; Go via Stripe is live
          today.
        </p>
      ) : null}

      {!cardTier ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          PayPal is on Vendl Pro. Your account does not have Pro access
          yet.
        </p>
      ) : null}

      {cardTier && connectAvailable ? <PayPalWarnings billingCurrency={owner.billingCurrency} /> : null}

      {!configured && connectAvailable ? (
        <p className="text-sm text-red-700">
          Add <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_ID</code>{" "}
          and{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_SECRET</code>{" "}
          on the server, with{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_MODE=live</code>.
        </p>
      ) : null}

      <section
        className={`space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm${connectAvailable ? "" : " opacity-55"}`}
      >
        <p>
          Merchant ID:{" "}
          {owner.paypalMerchantId ? (
            <code className="text-xs">{owner.paypalMerchantId}</code>
          ) : (
            "Not connected"
          )}
        </p>
        {marketplace ? (
          <p>Onboarding complete: {ready ? "Yes" : "No"}</p>
        ) : null}
        <p>
          Offering PayPal at checkout:{" "}
          {owner.paypalPaymentsEnabled ? "On" : "Off"}
        </p>
      </section>

      {cardTier && connectAvailable && configured && !marketplace ? (
        <PayPalMerchantIdForm merchantId={owner.paypalMerchantId} />
      ) : null}

      {cardTier && connectAvailable && marketplace ? (
        <PayPalMarketplacePanel
          configured={configured}
          connected={connected}
          canDirect={canDirect && Boolean(directMerchantId)}
          partner={params.partner}
          connectedDirect={params.connected === "direct"}
        />
      ) : null}

      {cardTier && connectAvailable && connected && ready ? (
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
