import Link from "next/link";
import type { BusinessSiteUrl } from "@/lib/storefront/business-site-url";

export type StoreLink = { url: string; label: string };

const boxClass = "truncate rounded-lg border border-[var(--line)] bg-[var(--wash)] px-3 py-2.5";

export default function StandSiteUrlField({
  site,
  isPro,
}: {
  site: BusinessSiteUrl | null;
  isPro: boolean;
  /** @deprecated kept for call-site compatibility; shop URL comes from `site`. */
  storeLink?: StoreLink;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{isPro ? "Your site URL" : "Your store link"}</span>
      {site ? (
        <a href={site.url} target="_blank" rel="noreferrer" className={`${boxClass} text-[var(--leaf-dark)] underline`}>
          {site.label}
        </a>
      ) : (
        <span className={`${boxClass} text-[var(--muted)]`}>No store address yet</span>
      )}
      <span className="text-[var(--muted)]">
        {site?.customDomain
          ? "Your connected domain."
          : "Your vendl.app shop address (same shape as Web Studio)."}
        {site && !site.published && isPro ? " Website draft — publish when you're ready." : ""}{" "}
        {isPro ? (
          <Link href="/dashboard/website/domains" className="underline">
            {site?.customDomain ? "Manage domain" : "Connect a domain"}
          </Link>
        ) : (
          <>
            <Link href="/dashboard/settings/billing" className="font-semibold text-[var(--field)] underline">
              Upgrade to Pro
            </Link>{" "}
            to connect your own domain.
          </>
        )}
      </span>
    </div>
  );
}
