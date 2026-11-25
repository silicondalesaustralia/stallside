import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isSquareConnectEnabled,
  isSquareIntegrationEnabled,
  isSquareSubscriptionsEnabled,
  squareConnectDiagnostics,
  squareEnvironment,
} from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import {
  squareConnectionMatchesBilling,
  squareRegionForBilling,
} from "@/lib/commerce/payment-rail";
import { squareRegionCurrency } from "@/lib/square/region";
import SquareRegionNotice from "./SquareRegionNotice";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import SquareConnectForm from "./SquareConnectForm";
import SquareCapabilityForm from "./SquareCapabilityForm";
import SquareLocationForm from "./SquareLocationForm";
import SquareMappingPanel from "./SquareMappingPanel";
import SquarePushSection from "./SquarePushSection";
import SquareImportPanel from "./SquareImportPanel";
import SquareSubscriptionsToggle from "./SquareSubscriptionsToggle";
import { hasSquareSubscriptionScopes } from "@/lib/square/scopes";

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

  const region = squareRegionForBilling(owner.billingCurrency);
  if (!isSquareIntegrationEnabled() || !region) {
    redirect("/dashboard/payments");
  }
  const squareCurrency = squareRegionCurrency(region);

  const enabled = isSquareConnectEnabled();
  const diagnostics = enabled ? null : squareConnectDiagnostics();
  const conn = enabled ? await getSquareConnection(owner.id) : null;
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id, isActive: true },
    select: { id: true, name: true, currency: true },
    orderBy: { name: "asc" },
  });
  const squareStands = stands.filter(
    (s) => s.currency.trim().toUpperCase() === squareCurrency,
  );
  const mappingCount = conn
    ? await prisma.externalVariantMapping.count({
        where: { connectionId: conn.id, confirmedAt: { not: null } },
      })
    : 0;
  const regionMismatch = Boolean(
    conn && conn.status === "ACTIVE" && !squareConnectionMatchesBilling(conn, owner.billingCurrency),
  );
  const active = conn?.status === "ACTIVE" && !regionMismatch;
  const statusLabel = active
    ? "Connected"
    : conn?.status === "NEEDS_REAUTH"
      ? "Needs reconnection"
      : conn
        ? conn.status
        : "Not connected";

  return (
    <main className="flex w-full max-w-3xl flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/payments" className="underline">
          Payments
        </Link>
      </p>
      <div>
        <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight">
          <PaymentBrandIcon brand="square" className="size-8" />
          Square
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connect Square for card checkout on Vendl and two-way stock sync with
          Square POS. Pick Stripe or Square as the product checkout provider on{" "}
          <Link href="/dashboard/payments" className="underline">
            Payments
          </Link>
          .
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
          Square connected. Choose a location and turn on what you need below.
        </p>
      ) : null}
      {params.disconnected === "1" ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Square disconnected. Last synced stock and product links were kept.
        </p>
      ) : null}
      <SquareRegionNotice
        region={region}
        error={params.error}
        mismatch={regionMismatch}
      />
      {params.error && !params.error.startsWith("region") ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not complete Square connection ({params.error}).
        </p>
      ) : null}

      {enabled ? (
        <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <div className="space-y-1">
            <p>
              Status: <strong>{statusLabel}</strong>
              {conn?.merchantName ? (
                <>
                  {" "}
                  · <strong>{conn.merchantName}</strong>
                </>
              ) : null}
            </p>
            {squareEnvironment() === "sandbox" ? (
              <p className="text-[var(--muted)]">Sandbox mode</p>
            ) : null}
          </div>
          <SquareConnectForm
            connected={Boolean(active)}
            sandbox={squareEnvironment() === "sandbox"}
          />
        </section>
      ) : null}

      {active && conn ? (
        <>
          <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
            <h2 className="text-lg font-semibold">Location</h2>
            <p className="text-[var(--muted)]">
              Square stock is per location. Pick the primary one to sync, and
              map each location to a Vendl business if you use more than one.
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

          <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
            <h2 className="text-lg font-semibold">Use Square for</h2>
            <SquareCapabilityForm
              paymentsEnabled={conn.paymentsEnabled}
              inventorySyncEnabled={conn.inventorySyncEnabled}
              catalogSyncEnabled={conn.catalogSyncEnabled}
            />
            <p className="text-[var(--muted)]">
              Product checkout currently uses{" "}
              <strong className="text-[var(--ink)]">
                {owner.onlinePaymentProvider === "SQUARE" ? "Square" : "Stripe"}
              </strong>
              .{" "}
              <Link href="/dashboard/payments" className="underline">
                Change in Payments
              </Link>
              {conn.inventorySyncEnabled
                ? conn.lastSyncAt
                  ? ` · Stock last synced ${conn.lastSyncAt.toLocaleString()}`
                  : " · Stock sync on, awaiting first update"
                : ""}
              {conn.lastError ? (
                <span className="text-red-700">
                  {" "}
                  · Needs attention — contact support if this persists.
                </span>
              ) : null}
            </p>
          </section>

          {isSquareSubscriptionsEnabled() ? (
            <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
              <h2 className="text-lg font-semibold">Subscriptions &amp; memberships</h2>
              <SquareSubscriptionsToggle
                enabled={conn.subscriptionsEnabled}
                hasScopes={hasSquareSubscriptionScopes(conn.scopes)}
                checkoutOnSquare={owner.onlinePaymentProvider === "SQUARE"}
              />
            </section>
          ) : null}

          <section className="space-y-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
            <div>
              <h2 className="text-lg font-semibold">Products &amp; stock</h2>
              <p className="mt-1 text-[var(--muted)]">
                {mappingCount} confirmed link{mappingCount === 1 ? "" : "s"}.
                Match items yourself — Vendl never auto-links from fuzzy names
                alone.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Review matches</h3>
              <SquareMappingPanel catalogEnabled={conn.catalogSyncEnabled} />
            </div>

            <div className="space-y-3 border-t border-[var(--line)] pt-4">
              <h3 className="font-semibold">Import from Square</h3>
              {conn.catalogSyncEnabled ? (
                <SquareImportPanel
                  stands={squareStands}
                  currency={squareCurrency}
                  defaultStandId={
                    squareStands.find(
                      (s) => s.id === conn.locations.find((l) => l.isPrimary)?.standId,
                    )?.id ?? null
                  }
                />
              ) : (
                <p className="text-[var(--muted)]">
                  Turn on product / catalogue sync above to import Square items.
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-[var(--line)] pt-4">
              <h3 className="font-semibold">Add Vendl products to Square</h3>
              <SquarePushSection
                ownerId={owner.id}
                connectionId={conn.id}
                catalogEnabled={conn.catalogSyncEnabled}
                stockWillSync={conn.inventorySyncEnabled && Boolean(conn.primaryLocationId)}
                currency={squareCurrency}
              />
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
