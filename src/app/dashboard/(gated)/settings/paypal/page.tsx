import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import {
  isPayPalConfigured,
  isPayPalConnectAvailable,
  isPayPalDirectMode,
  isPayPalMarketplaceMode,
  paypalDirectMerchantId,
  paypalPartnerMerchantId,
  paypalPlatformMerchantIds,
} from "@/lib/paypal";
import { hasComplimentaryAccess } from "@/lib/owner-trial";
import { syncPayPalMerchantStatus } from "@/lib/paypal-sync";
import {
  connectPayPalDirect,
  disconnectPayPal,
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
    disconnected?: string;
    sync?: string;
  }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const canDirect =
    isPayPalDirectMode() ||
    hasComplimentaryAccess({ email: user.email, role: user.role });
  const directMerchantId = paypalDirectMerchantId();

  if (
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
  const partnerMerchantId = configured ? paypalPartnerMerchantId() : null;
  const connectAvailable = isPayPalConnectAvailable();
  const marketplaceMode = isPayPalMarketplaceMode();
  const bnConfigured = Boolean(process.env.PAYPAL_BN_CODE?.trim());
  const connected = Boolean(owner.paypalMerchantId);
  const isDirectLinked =
    connected &&
    Boolean(directMerchantId) &&
    owner.paypalMerchantId === directMerchantId;
  const isPlatformMerchantLinked =
    connected &&
    marketplaceMode &&
    Boolean(owner.paypalMerchantId) &&
    paypalPlatformMerchantIds().has(owner.paypalMerchantId ?? "");
  const ready = owner.paypalOnboardingComplete;
  const partnerDenied = params.partner === "denied";
  const partnerDirectHint = params.partner === "direct";
  const partnerError = params.partner === "error";
  const connectedDirect = params.connected === "direct";
  const disconnected = params.disconnected === "1";
  const syncFailed = params.sync === "failed";

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div className={connectAvailable ? undefined : "opacity-55"}>
        <h1 className="text-3xl font-semibold tracking-tight">PayPal Connect</h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect PayPal so customers can pay after scanning your Vendl QR.
          Available on Free and Pro. Free includes a 2.5% Vendl fee on PayPal
          sales unless you upgrade to Pro.
        </p>
      </div>

      {!connectAvailable ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          PayPal Connect is coming soon. Card / Tap &amp; Go via Stripe is live
          today.
        </p>
      ) : null}

      {marketplaceMode ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
          <strong>Marketplace mode.</strong> Each seller connects their own
          PayPal Business account. Customer payments go to the seller; Vendl
          collects a platform fee on Free (2.5%) via PayPal Partner fees.
          {!bnConfigured ? (
            <>
              {" "}
              Set <code className="rounded bg-black/5 px-1">PAYPAL_BN_CODE</code>{" "}
              on the server for partner attribution.
            </>
          ) : null}
        </p>
      ) : null}

      {partnerDenied ? (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">
            Partner Referrals returned 403 — your REST app cannot onboard sellers yet.
          </p>
          <p>
            The current <strong>Vendl</strong> app is likely a standard Merchant app.
            Marketplace needs a <strong>Platform</strong> REST app (Australia is supported).
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              PayPal Developer → Apps &amp; Credentials → Create App → App type{" "}
              <strong>Platform</strong> (not Merchant).
            </li>
            <li>
              On that app, toggle on <strong>Platform Fee</strong> (must match our
              PARTNER_FEE API feature).
            </li>
            <li>
              Copy the new sandbox Client ID, Secret, BN code, and platform
              Business merchant id into <code className="rounded bg-black/5 px-1">.env</code>.
            </li>
            <li>
              Remove or comment out{" "}
              <code className="rounded bg-black/5 px-1">PAYPAL_CONNECT_MODE=direct</code>{" "}
              and restart the dev server.
            </li>
          </ol>
          <p>
            <a
              className="underline"
              href="https://developer.paypal.com/docs/multiparty/integration-checklist/"
              target="_blank"
              rel="noreferrer"
            >
              PayPal multiparty checklist
            </a>
            {" · "}
            <a
              className="underline"
              href="https://developer.paypal.com/platforms/create-account"
              target="_blank"
              rel="noreferrer"
            >
              Create Platform account
            </a>
          </p>
          {canDirect ? (
            <p>
              Until then, use{" "}
              <strong>Use platform PayPal (direct test)</strong> below — checkout
              works; funds go to your sandbox Business account in env.
            </p>
          ) : null}
        </div>
      ) : null}

      {partnerDirectHint ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Marketplace Connect is disabled while{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_CONNECT_MODE=direct</code>.
          Comment that out in <code className="rounded bg-black/5 px-1">.env</code> after
          your Platform REST app is configured, then restart the server.
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
          Linked to the platform PayPal Business account for sandbox testing.
          Disconnect before connecting a real seller account in marketplace mode.
        </p>
      ) : null}

      {syncFailed ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          Could not sync PayPal yet. If you finished onboarding on PayPal, paste your{" "}
          <strong>seller</strong> merchant ID below (Test Store account → Account ID on
          sandbox.paypal.com), or fix{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_PARTNER_MERCHANT_ID</code> in{" "}
          <code className="rounded bg-black/5 px-1">.env</code> — use the Platform Partner
          App Account ID (letters/numbers like <code className="rounded bg-black/5 px-1">T9WERV2MAP33C</code>,
          not the long number from the app name).
        </p>
      ) : null}

      {isPlatformMerchantLinked ? (
        <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
          <p className="font-semibold">Wrong PayPal account linked</p>
          <p>
            The merchant ID saved here is the Vendl <strong>platform</strong>{" "}
            partner account — not your seller store. Checkout will pay the
            platform app, not your Test Store. Disconnect, then sync your{" "}
            <strong>Test Store</strong> seller merchant ID (a different 13-character
            ID from the platform&apos;s{" "}
            <code className="rounded bg-black/5 px-1">
              {partnerMerchantId ?? "partner id"}
            </code>
            ).
          </p>
        </div>
      ) : null}

      {disconnected ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
          PayPal disconnected. PayPal was turned off on all businesses.
        </p>
      ) : null}

      {connectAvailable ? (
        <PayPalWarnings billingCurrency={owner.billingCurrency} />
      ) : null}

      {!configured && connectAvailable ? (
        <p className="text-sm text-red-700">
          Add <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_ID</code>,{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_CLIENT_SECRET</code>,
          and{" "}
          <code className="rounded bg-black/5 px-1">
            PAYPAL_PARTNER_MERCHANT_ID
          </code>{" "}
          on the server, with{" "}
          <code className="rounded bg-black/5 px-1">PAYPAL_MODE=live</code> or{" "}
          <code className="rounded bg-black/5 px-1">sandbox</code>.
        </p>
      ) : null}

      <section
        className={`space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm${connectAvailable ? "" : " opacity-55"}`}
      >
        <p>
          Merchant ID:{" "}
          {owner.paypalMerchantId ? (
            <>
              <code className="text-xs">{owner.paypalMerchantId}</code>
              {isDirectLinked ? (
                <span className="ml-2 text-[var(--muted)]">(platform test)</span>
              ) : marketplaceMode && connected ? (
                <span className="ml-2 text-[var(--muted)]">(seller account)</span>
              ) : null}
            </>
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

      {connectAvailable ? (
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
            <>
              <form action={refreshPayPalStatus}>
                <button
                  type="submit"
                  className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold"
                >
                  Refresh status
                </button>
              </form>
              <form action={disconnectPayPal}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-800"
                >
                  Disconnect PayPal
                </button>
              </form>
            </>
          ) : null}
        </div>
      ) : null}

      {connectAvailable && connected ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <p className="font-semibold">Re-link seller account</p>
          <p className="text-[var(--muted)]">
            Paste your seller merchant ID if you linked the wrong sandbox account.
          </p>
          <form action={refreshPayPalStatus} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              name="merchantIdInPayPal"
              placeholder="Seller merchant ID"
              className="min-w-0 flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
            >
              Update seller ID
            </button>
          </form>
        </section>
      ) : null}

      {connectAvailable && !connected ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <p className="font-semibold">Finished PayPal onboarding?</p>
          <p className="text-[var(--muted)]">
            Sandbox often won&apos;t redirect back to localhost. Sync links your Test Store
            seller account to Vendl.
          </p>
          <form action={refreshPayPalStatus} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              name="merchantIdInPayPal"
              placeholder="Seller merchant ID (optional)"
              className="min-w-0 flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
            >
              Sync from PayPal
            </button>
          </form>
        </section>
      ) : null}

      {connectAvailable && connected && ready ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <p className="font-semibold">Show PayPal at checkout</p>
          <p className="text-[var(--muted)]">
            Customers see PayPal when this is on. USD stands can also show
            Venmo. Then enable PayPal on each business under My Businesses.
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
