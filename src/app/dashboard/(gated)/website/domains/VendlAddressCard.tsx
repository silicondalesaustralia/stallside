import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import DomainsCopyButton from "./DomainsCopyButton";

export default function VendlAddressCard({
  vendlHost,
  liveUrl,
  customHostname,
  published,
  previewUrl,
}: {
  vendlHost: string;
  liveUrl: string;
  /** When set, live site prefers this over the Vendl subdomain. */
  customHostname?: string | null;
  /** Unpublished sites 404 on every public address, custom domain included. */
  published: boolean;
  /** Owner-only draft view at the Vendl address. */
  previewUrl: string;
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
      {!published ? (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--warn)]/40 bg-[var(--marigold)]/10 p-4">
          <p className="text-sm font-semibold text-[var(--field)]">
            Your website isn&apos;t published yet
          </p>
          <p className="text-sm text-[var(--muted)]">
            {primaryHost} will show &ldquo;page not found&rdquo; until you publish. Preview your
            draft at{" "}
            <a href={previewUrl} target="_blank" rel="noreferrer" className="font-medium underline">
              {vendlHost}
            </a>
            , then publish to go live.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/website/studio" className={dashCtaClass}>
              Publish website
            </Link>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--field)]"
            >
              Preview site
            </a>
          </div>
        </div>
      ) : (
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
      )}
      <p className="text-xs text-[var(--muted)]">
        Change your Vendl address in{" "}
        <Link href="/dashboard/website/web-studio?tab=details" className="underline">
          Business details
        </Link>{" "}
        (slug).
      </p>
    </section>
  );
}
