import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isSquareConnectEnabled,
  isSquarePaymentsEnabled,
  isSquareAppFeesEnabled,
  squareConnectDiagnostics,
  squareEnvironment,
} from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { shouldChargeVendlFee } from "@/lib/stallside-fee";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import SquareConnectForm from "./SquareConnectForm";
import SquareCapabilityForm from "./SquareCapabilityForm";
import SquareLocationForm from "./SquareLocationForm";
import SquareProviderForm from "./SquareProviderForm";
import SquareMappingPanel from "./SquareMappingPanel";

export default async function SquareSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    connected?: string;
    disconnected?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;

  if (!squareEligibleBillingCurrency(owner.billingCurrency)) {
    redirect("/dashboard/settings/payments");
  }

  const enabled = isSquareConnectEnabled();
  const diagnostics = enabled ? null : squareConnectDiagnostics();
  const conn = enabled ? await getSquareConnection(owner.id) : null;
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const mappingCount = conn
    ? await prisma.externalVariantMapping.count({
        where: { connectionId: conn.id, confirmedAt: { not: null } },
      })
    : 0;
  const feeApplies = shouldChargeVendlFee(owner);
  const active = conn?.status === "ACTIVE";

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings/payments" className="underline">
          Payments
        </Link>
      </p>
      <div>
        <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight">
          <PaymentBrandIcon brand="square" className="size-8" />
          Square
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect your existing Square account to accept Square payments on your
          Vendl website and keep product stock in sync with Square POS. Online
          card checkout uses Stripe or Square — pick one below.
        </p>
      </div>

      {!enabled && diagnostics ? (
        <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
          <p>
            Square Connect is off in this runtime. Vars must be on the same
            Vercel environment this host uses, then redeploy.
          </p>
          <ul className="list-inside list-disc text-[var(--muted)]">
            <li>
              Runtime env:{" "}
              <span className="font-medium text-[var(--ink)]">
                {diagnostics.vercelEnv}
              </span>
            </li>
            <li>
              SQUARE_INTEGRATION_ENABLED=1:{" "}
              {diagnostics.integrationEnabled ? "yes" : "no"}
            </li>
            <li>
              SQUARE_CONNECT_ENABLED not 0:{" "}
              {diagnostics.connectAllowed ? "yes" : "no"}
            </li>
            <li>
              SQUARE_APPLICATION_ID present:{" "}
              {diagnostics.hasApplicationId ? "yes" : "no"}
            </li>
            <li>
              SQUARE_APPLICATION_SECRET present:{" "}
              {diagnostics.hasApplicationSecret ? "yes" : "no"}
            </li>
          </ul>
          {diagnostics.vercelEnv === "production" ? (
            <p className="text-[var(--muted)]">
              This deployment is Production. Preview-only Square vars will not
              apply — add them to Production, or point staging.vendl.app at a
              Preview/Staging deployment and redeploy.
            </p>
          ) : null}
        </div>
      ) : null}

      {params.connected === "1" ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
          Square connected. Choose a location and enable the capabilities you
          want.
        </p>
      ) : null}
      {params.disconnected === "1" ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Square disconnected. Vendl kept last synced stock quantities. Mappings
          were retained for history.
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not complete Square connection ({params.error}).
        </p>
      ) : null}

      {enabled ? (
        <section className="space-y-3 text-sm">
          <h2 className="text-lg font-semibold">Connection</h2>
          <p>
            Status:{" "}
            {active
              ? "Connected"
              : conn?.status === "NEEDS_REAUTH"
                ? "Needs reconnection"
                : conn
                  ? conn.status
                  : "Not connected"}
          </p>
          {conn?.merchantName ? (
            <p>
              Merchant: <strong>{conn.merchantName}</strong>
            </p>
          ) : null}
          <p className="text-[var(--muted)]">
            Environment: {squareEnvironment()}
            {isSquarePaymentsEnabled() ? " · payments ready" : " · payments gated"}
            {isSquareAppFeesEnabled()
              ? " · app fees on"
              : " · production app fees off"}
          </p>
          <SquareConnectForm
            connected={Boolean(active)}
            sandbox={squareEnvironment() === "sandbox"}
          />
        </section>
      ) : null}

      {active && conn ? (
        <>
          <section className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Location</h2>
            <p className="text-[var(--muted)]">
              Square inventory is location-aware. Pick the primary location to
              sync.
            </p>
            <SquareLocationForm
              locations={conn.locations.map((l) => ({
                id: l.providerLocationId,
                name: l.providerLocationName ?? l.providerLocationId,
                standId: l.standId,
                isPrimary: l.isPrimary,
              }))}
              stands={stands}
              primaryLocationId={conn.primaryLocationId}
            />
          </section>

          <section className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Use Square for</h2>
            <SquareCapabilityForm
              paymentsEnabled={conn.paymentsEnabled}
              inventorySyncEnabled={conn.inventorySyncEnabled}
              catalogSyncEnabled={conn.catalogSyncEnabled}
            />
          </section>

          <section className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Online payment provider</h2>
            <p className="text-[var(--muted)]">
              Choose Stripe or Square for online card checkout — not both at
              once. Free plan still collects a 2.5% Vendl fee on Vendl-originated
              Square checkout
              {feeApplies ? " (your account)" : " (waived on Pro)"}. Square POS
              sales never incur a Vendl fee.
            </p>
            <SquareProviderForm
              current={owner.onlinePaymentProvider}
              squarePaymentsReady={conn.paymentsEnabled}
              stripeReady={owner.stripeChargesEnabled}
            />
          </section>

          <section className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="text-[var(--muted)]">
              {mappingCount} confirmed mapping{mappingCount === 1 ? "" : "s"}.
              Match Square items with Vendl products — never auto-mapped from
              fuzzy names alone.
            </p>
            <SquareMappingPanel catalogEnabled={conn.catalogSyncEnabled} />
          </section>

          <section className="space-y-2 text-sm">
            <h2 className="text-lg font-semibold">Sync health</h2>
            <ul className="list-inside list-disc text-[var(--muted)]">
              <li>
                Payments:{" "}
                {conn.paymentsEnabled ? "Ready" : "Off"}
              </li>
              <li>
                Inventory:{" "}
                {conn.inventorySyncEnabled
                  ? conn.lastSyncAt
                    ? `Synced · ${conn.lastSyncAt.toLocaleString()}`
                    : "On · awaiting first sync"
                  : "Off"}
              </li>
              <li>
                Catalogue: {conn.catalogSyncEnabled ? "On" : "Off"}
              </li>
            </ul>
            {conn.lastError ? (
              <p className="text-red-700">Needs attention — open support if this persists.</p>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}
