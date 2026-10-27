import Link from "next/link";
import type { BusinessSiteUrl } from "@/lib/storefront/business-site-url";

export default function StandSiteUrlField({ site }: { site: BusinessSiteUrl | null }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">Your site URL</span>
      {site ? (
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-lg border border-[var(--line)] bg-[var(--wash)] px-3 py-2.5 text-[var(--leaf-dark)] underline"
        >
          {site.label}
        </a>
      ) : (
        <span className="rounded-lg border border-[var(--line)] bg-[var(--wash)] px-3 py-2.5 text-[var(--muted)]">
          No website yet
        </span>
      )}
      <span className="text-[var(--muted)]">
        {site?.customDomain ? "Your connected domain." : "Your free Vendl address."}
        {site && !site.published ? " Not published yet." : ""}{" "}
        <Link href="/dashboard/website/domains" className="underline">
          {site?.customDomain ? "Manage domain" : "Connect a domain"}
        </Link>
      </span>
    </div>
  );
}
