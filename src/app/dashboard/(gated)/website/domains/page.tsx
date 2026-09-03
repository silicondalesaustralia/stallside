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
import DomainsCopyButton from "./DomainsCopyButton";
import CustomDomainCard from "./CustomDomainCard";
import { connectDomainAction } from "./actions";
import { ownerCanUseCustomDomains } from "@/lib/domains/entitlements";
import { customDomainsFeatureEnabled } from "@/lib/domains/config";
import { getStorefrontUrl } from "@/lib/domains/preferred-origin";
import { loadPreferredOriginInput } from "@/lib/domains/resolve";

const ERROR_COPY: Record<string, string> = {
  feature_disabled: "Custom domains are not enabled on this environment yet.",
  not_entitled: "Custom domains are included with Vendl Pro.",
  invalid_hostname: "Enter a hostname such as www.yourdomain.com.",
  apex_use_www:
    "Connect www.yourdomain.com for now — bare domains (yourdomain.com) aren’t supported yet. You can redirect the bare domain to www at your DNS host.",
  conflict: "This domain is already connected to another Vendl store.",
  cloudflare_unconfigured: "Domain infrastructure is not configured yet.",
  cloudflare_error: "Cloudflare could not process that domain. Try again shortly.",
  not_found: "Domain not found.",
};

export default async function WebsiteDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    connected?: string;
    checked?: string;
    primary?: string;
    disconnected?: string;
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
  const vendlHost = storefrontSubdomainHost(storefront.slug);
  const subdomainLive = storefrontSubdomainPrimaryEnabled();
  const pathUrl = storefrontPublicUrl(storefront.slug, { forcePath: true });

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

      {params.connected ? (
        <p className="text-sm text-[var(--leaf-dark)]">Domain connected — add the DNS record below.</p>
      ) : null}
      {params.checked ? (
        <p className="text-sm text-[var(--leaf-dark)]">Status refreshed.</p>
      ) : null}
      {params.primary ? (
        <p className="text-sm text-[var(--leaf-dark)]">Primary domain updated.</p>
      ) : null}
      {params.disconnected ? (
        <p className="text-sm text-[var(--leaf-dark)]">Domain disconnected.</p>
      ) : null}
      {params.error && ERROR_COPY[params.error] ? (
        <p className="text-sm text-[var(--gone)]">{ERROR_COPY[params.error]}</p>
      ) : null}

      <section className="dash-card flex flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Your Vendl address
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          {vendlHost}
        </p>
        <p className="text-sm text-[var(--muted)]">
          Included with every account
          {!subdomainLive ? ` · also ${pathUrl}` : null}.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <a href={liveUrl} target="_blank" rel="noreferrer" className={dashCtaClass}>
            View site
          </a>
          <DomainsCopyButton value={liveUrl} label="Copy address" />
        </div>
        <p className="text-xs text-[var(--muted)]">
          Change your address in{" "}
          <Link href="/dashboard/website/details" className="underline">
            Shop details
          </Link>{" "}
          (slug).
        </p>
      </section>

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
          {domains.length === 0 ? (
            <form
              action={connectDomainAction}
              className="dash-card flex flex-col gap-4 p-5"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Connect your domain
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Enter your site as{" "}
                  <span className="font-mono font-semibold text-[var(--field)]">
                    www.yourfarm.com
                  </span>{" "}
                  (or{" "}
                  <span className="font-mono text-[var(--field)]">shop.yourfarm.com</span>
                  {" "}
                  if the main site stays elsewhere).
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Don&apos;t enter the bare domain alone (yourfarm.com) — that
                  can&apos;t be activated yet. After www works, add a redirect from
                  yourfarm.com → www at your DNS host so customers can still type
                  the short address.
                </p>
              </div>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">Hostname</span>
                <input
                  name="hostname"
                  required
                  placeholder="www.yourfarm.com"
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                />
                <span className="text-xs text-[var(--muted)]">
                  Must include www or another subdomain (e.g. shop).
                </span>
              </label>
              <button type="submit" className={dashCtaClass}>
                Continue
              </button>
            </form>
          ) : null}
        </>
      )}
    </main>
  );
}
