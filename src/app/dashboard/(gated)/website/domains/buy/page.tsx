import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { domainPurchaseEnabled } from "@/lib/domains/config";
import { createNamecheapRegistrar } from "@/lib/domains/registrar/namecheap/provider";
import { namecheapConfigured } from "@/lib/domains/registrar/namecheap/config";
import { domainTld } from "@/lib/domains/registrar/namecheap/au-attrs";
import {
  parseDomainRetailCurrency,
  retailFromRegistrarUsd,
} from "@/lib/domains/registrar/retail-pricing";
import { BILLING_CURRENCIES } from "@/lib/saas-pricing";
import BuyDomainForm from "./BuyDomainForm";

const ERRORS: Record<string, string> = {
  disabled: "Domain purchase is not enabled yet.",
  unavailable: "That domain is no longer available.",
  premium: "Premium domains are not enabled.",
  config: "Purchase infrastructure is not configured.",
  stripe: "Could not start payment.",
  invalid: "Check the domain and eligibility details.",
};

export default async function BuyDomainPage({
  searchParams,
}: {
  searchParams: Promise<{
    domain?: string;
    currency?: string;
    error?: string;
    cancelled?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const domain = (params.domain || "").trim().toLowerCase();
  const purchaseOn = domainPurchaseEnabled();
  const currency = parseDomainRetailCurrency(
    params.currency,
    parseDomainRetailCurrency(owner.billingCurrency, "AUD"),
  );

  if (!domain) {
    return (
      <main className="flex flex-col gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Buy a domain
        </h1>
        <p className="text-sm text-[var(--muted)]">Pick a domain from search first.</p>
        <Link href="/dashboard/website/domains" className={dashCtaClass}>
          Back to Domains
        </Link>
      </main>
    );
  }

  const tld = domainTld(domain);
  const needsAu = tld === "com.au" || tld === "net.au";
  let priceLine = "";
  if (namecheapConfigured()) {
    try {
      const registrar = createNamecheapRegistrar();
      const wholesale = await registrar.getRegistrationPrice(domain, 1);
      const renewal = await registrar.getRenewalPrice(domain, 1);
      const retail = retailFromRegistrarUsd(wholesale, currency).retail;
      const renew = retailFromRegistrarUsd(renewal, currency).retail;
      priceLine = `${retail.currencyCode} ${(retail.value / 100).toFixed(2)} first year · renews ${(renew.value / 100).toFixed(2)}/yr`;
    } catch {
      /* optional */
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Buy a domain
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">
          {domain}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          You will be the legal registrant.
          {priceLine ? ` · ${priceLine}` : null}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">Currency:</span>
          {BILLING_CURRENCIES.map((c) => (
            <Link
              key={c}
              href={`/dashboard/website/domains/buy?domain=${encodeURIComponent(domain)}&currency=${c}`}
              className={
                c === currency
                  ? "font-semibold text-[var(--field)] underline"
                  : "text-[var(--muted)] underline"
              }
            >
              {c}
            </Link>
          ))}
        </p>
      </div>

      {params.cancelled ? (
        <p className="text-sm text-[var(--muted)]">Checkout cancelled.</p>
      ) : null}
      {params.error && ERRORS[params.error] ? (
        <p className="text-sm text-[var(--gone)]">{ERRORS[params.error]}</p>
      ) : null}

      {!purchaseOn ? (
        <p className="text-sm text-[var(--muted)]">
          Purchase is not enabled on this environment yet.
        </p>
      ) : (
        <BuyDomainForm
          domain={domain}
          tld={tld}
          needsAu={needsAu}
          businessName={owner.businessName}
          contactEmail={owner.contactEmail}
          currency={currency}
        />
      )}
    </main>
  );
}
