import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";

/** Side-by-side path pickers for Buy vs Connect. */
export default function DomainPathCards({
  searchEnabled,
}: {
  searchEnabled: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="dash-card flex flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          New domain
        </p>
        <p className="text-sm text-[var(--muted)]">
          Search and register .com.au, .com, or .net.au. You&apos;ll be the legal
          registrant — we connect it for you after purchase.
        </p>
        {searchEnabled ? (
          <Link
            href="/dashboard/website/domains?path=buy"
            className={`${dashCtaClass} mt-auto self-start`}
          >
            Purchase A Domain Name
          </Link>
        ) : (
          <p className="mt-auto text-xs text-[var(--muted)]">
            Domain purchase isn&apos;t enabled on this environment yet.
          </p>
        )}
      </section>

      <section className="dash-card flex flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Existing domain
        </p>
        <p className="text-sm text-[var(--muted)]">
          Already own a domain? Point www at Vendl and we&apos;ll finish setup with
          Cloudflare.
        </p>
        <Link
          href="/dashboard/website/domains?path=connect"
          className={`${dashCtaClass} mt-auto self-start`}
        >
          Connect An Existing Domain
        </Link>
      </section>
    </div>
  );
}
