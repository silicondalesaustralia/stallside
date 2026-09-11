import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import DomainsCopyButton from "./DomainsCopyButton";

export default function VendlAddressCard({
  vendlHost,
  liveUrl,
  customHostname,
}: {
  vendlHost: string;
  liveUrl: string;
  /** When set, live site prefers this over the Vendl subdomain. */
  customHostname?: string | null;
}) {
  const primaryHost = customHostname?.trim() || vendlHost;
  const primaryUrl = customHostname?.trim()
    ? `https://${customHostname.trim()}`
    : liveUrl;

  return (
    <section className="dash-card flex flex-col gap-3 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Your public address
      </p>
      <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        {primaryHost}
      </p>
      <p className="text-sm text-[var(--muted)]">
        {customHostname?.trim()
          ? `Custom domain connected. Vendl address stays ${vendlHost}.`
          : "Included with every account. Add a custom domain below if you want your own web address."}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          className={dashCtaClass}
        >
          View site
        </a>
        <DomainsCopyButton value={primaryUrl} label="Copy address" />
      </div>
      <p className="text-xs text-[var(--muted)]">
        Change your Vendl address in{" "}
        <Link href="/dashboard/website/details" className="underline">
          Business details
        </Link>{" "}
        (slug).
      </p>
    </section>
  );
}
