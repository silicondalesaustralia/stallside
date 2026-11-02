import Link from "next/link";
import type { BusinessSiteUrl } from "@/lib/storefront/business-site-url";

export type StoreLink = { url: string; label: string };

const boxClass = "truncate rounded-lg border border-[var(--line)] bg-[var(--wash)] px-3 py-2.5";

export default function StandSiteUrlField({
  site,
  isPro,
  storeLink,
}: {
  site: BusinessSiteUrl | null;
  isPro: boolean;
  /** The stand's vendl.app/s/… link: free stores' only public address. */
  storeLink: StoreLink;
}) {
  if (!isPro) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Your store link</span>
        <a href={storeLink.url} target="_blank" rel="noreferrer" className={`${boxClass} text-[var(--leaf-dark)] underline`}>
          {storeLink.label}
        </a>
        <span className="text-[var(--muted)]">
          <Link href="/dashboard/settings/billing" className="font-semibold text-[var(--field)] underline">
            Upgrade to Pro
          </Link>{" "}
          to claim {site ? <strong>{site.label}</strong> : "your own vendl.app address"} or connect your own domain.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">Your site URL</span>
      {site ? (
        <a href={site.url} target="_blank" rel="noreferrer" className={`${boxClass} text-[var(--leaf-dark)] underline`}>
          {site.label}
        </a>
      ) : (
        <span className={`${boxClass} text-[var(--muted)]`}>No website yet</span>
      )}
      <span className="text-[var(--muted)]">
        {site?.customDomain ? "Your connected domain." : "Your vendl.app address."}
        {site && !site.published ? " Not published yet." : ""}{" "}
        <Link href="/dashboard/website/domains" className="underline">
          {site?.customDomain ? "Manage domain" : "Connect a domain"}
        </Link>
      </span>
    </div>
  );
}
