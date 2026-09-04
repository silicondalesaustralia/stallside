import { dashCtaClass } from "@/components/DashPrimaryCta";
import DomainsCopyButton from "./DomainsCopyButton";

/**
 * Staging-only preview of the post-connect Domains card so we can QA the
 * live look without waiting on Namecheap/Cloudflare sandbox completion.
 */
export default function StagingConnectedPreview({
  hostname,
}: {
  hostname: string;
}) {
  const www = hostname.startsWith("www.") ? hostname : `www.${hostname}`;
  const href = `https://${www}`;

  return (
    <section className="dash-card flex flex-col gap-4 border-[var(--leaf)]/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--leaf-dark)]">
        Staging preview · connected look
      </p>
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
          {www}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Status: Active · Primary
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Cloudflare hostname: active · certificate: active
        </p>
      </div>
      <p className="text-sm text-[var(--leaf-dark)]">
        Your domain is now connected. Visitors can open your site at this address
        once DNS and SSL are live (this card is a staging mock of that state).
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={href} target="_blank" rel="noreferrer" className={dashCtaClass}>
          View site
        </a>
        <DomainsCopyButton value={href} label="Copy address" />
      </div>
    </section>
  );
}
