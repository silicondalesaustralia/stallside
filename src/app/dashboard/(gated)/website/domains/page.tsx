import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { APP_DOMAIN } from "@/lib/constants";
import {
  storefrontPublicUrl,
  storefrontSubdomainHost,
  storefrontSubdomainPrimaryEnabled,
} from "@/lib/tenancy/public-url";
import CustomDomainCard from "./CustomDomainCard";
import BuyDomainSearch from "./BuyDomainSearch";
import DomainPathCards from "./DomainPathCards";
import ConnectDomainForm from "./ConnectDomainForm";
import VendlAddressCard from "./VendlAddressCard";
import DomainsFlash from "./DomainsFlash";
import { ownerCanUseCustomDomains } from "@/lib/domains/entitlements";
import {
  customDomainsFeatureEnabled,
  domainPurchaseEnabled,
  domainSearchEnabled,
} from "@/lib/domains/config";
import { getStorefrontUrl } from "@/lib/domains/preferred-origin";
import { loadPreferredOriginInput } from "@/lib/domains/resolve";

export default async function WebsiteDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{
    connected?: string;
    checked?: string;
    primary?: string;
    disconnected?: string;
    purchased?: string;
    path?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const ownerRow = await prisma.owner.findUniqueOrThrow({
    where: { id: owner.id },
    include: { user: { select: { email: true, role: true } } },
  });
  const canCustom = ownerCanUseCustomDomains(ownerRow, {
    email: ownerRow.user.email,
    role: ownerRow.user.role,
    lifetimeAccess: ownerRow.lifetimeAccess,
  });
  const featureOn = customDomainsFeatureEnabled();
  const searchOn = domainSearchEnabled();
  const purchaseOn = domainPurchaseEnabled();
  const path =
    params.path === "buy" || params.path === "connect" ? params.path : null;

  const domains = await prisma.storefrontDomain.findMany({
    where: {
      storefrontId: storefront.id,
      type: "CUSTOM",
      status: { not: "DISCONNECTED" },
    },
    orderBy: { createdAt: "desc" },
  });

  const preferred = await loadPreferredOriginInput(storefront);
  const liveUrl = getStorefrontUrl(preferred);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Domains
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Your included Vendl address and optional custom domain.
        </p>
      </div>

      <DomainsFlash
        purchased={params.purchased}
        connected={params.connected}
        checked={params.checked}
        primary={params.primary}
        disconnected={params.disconnected}
        error={params.error}
      />

      <VendlAddressCard
        vendlHost={storefrontSubdomainHost(storefront.slug)}
        pathUrl={storefrontPublicUrl(storefront.slug, { forcePath: true })}
        subdomainLive={storefrontSubdomainPrimaryEnabled()}
        liveUrl={liveUrl}
      />

      {!canCustom ? (
        <section className="dash-card flex flex-col gap-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Use your own domain
          </p>
          <p className="text-sm text-[var(--muted)]">
            Connect your existing domain and publish your Vendl website at your own web
            address. Included with Vendl Pro.
          </p>
          <Link href="/dashboard/settings/billing" className={dashCtaClass}>
            Upgrade to Pro
          </Link>
        </section>
      ) : !featureOn ? (
        <section className="dash-card p-5 text-sm text-[var(--muted)]">
          Custom domain connect is coming online soon. Your {APP_DOMAIN} address stays
          available.
        </section>
      ) : (
        <>
          {domains.map((d) => (
            <CustomDomainCard
              key={d.id}
              domain={{
                id: d.id,
                hostname: d.hostname,
                status: d.status,
                isPrimary: d.isPrimary,
                cnameTarget: d.cnameTarget,
                verificationMethod: d.verificationMethod,
                verificationName: d.verificationName,
                verificationValue: d.verificationValue,
                lastCheckedAt: d.lastCheckedAt,
                errorMessage: d.errorMessage,
                hostnameStatus: d.hostnameStatus,
                sslStatus: d.sslStatus,
              }}
            />
          ))}

          {domains.length === 0 && !path ? (
            <DomainPathCards searchEnabled={searchOn} />
          ) : null}

          {path === "buy" && searchOn ? (
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/website/domains"
                className="text-sm text-[var(--muted)] underline"
              >
                ← Back
              </Link>
              <BuyDomainSearch purchaseEnabled={purchaseOn} />
            </div>
          ) : null}

          {path === "connect" && domains.length === 0 ? (
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/website/domains"
                className="text-sm text-[var(--muted)] underline"
              >
                ← Back
              </Link>
              <ConnectDomainForm />
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
