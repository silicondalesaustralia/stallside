import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import DomainsCopyButton from "./DomainsCopyButton";

export default function VendlAddressCard({
  vendlHost,
  pathUrl,
  subdomainLive,
  liveUrl,
}: {
  vendlHost: string;
  pathUrl: string;
  subdomainLive: boolean;
  liveUrl: string;
}) {
  return (
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
  );
}
