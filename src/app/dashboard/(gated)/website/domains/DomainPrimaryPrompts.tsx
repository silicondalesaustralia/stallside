import { dashCtaClass } from "@/components/DashPrimaryCta";
import { makePrimaryDomainAction } from "./actions";

type Row = { id: string; hostname: string; status: string; isPrimary: boolean };

/**
 * Nudges after a domain connects: make it primary (so the subdomain, old links and QR
 * codes forward there) and forward the bare domain to www at the registrar.
 */
export default function DomainPrimaryPrompts({ domains }: { domains: Row[] }) {
  const active = domains.filter((d) => d.status === "ACTIVE");
  if (active.length === 0) return null;
  const primary = active.find((d) => d.isPrimary);
  const candidate = primary ?? active.find((d) => d.hostname.startsWith("www.")) ?? active[0];
  const apex = candidate.hostname.startsWith("www.") ? candidate.hostname.slice(4) : null;

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      {!primary ? (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Make {candidate.hostname} your main address</p>
          <p className="text-sm text-[var(--muted)]">
            Your domain is connected. Make it primary and your Vendl address, old stand links and printed QR
            codes will all forward to it.
          </p>
          <form action={makePrimaryDomainAction}>
            <input type="hidden" name="domainId" value={candidate.id} />
            <button type="submit" className={dashCtaClass}>
              Make primary
            </button>
          </form>
        </div>
      ) : null}
      {apex ? (
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Forward {apex} to www</p>
          <p className="text-sm text-[var(--muted)]">
            Some visitors type {apex} without the www. At your domain registrar, add a forward (301 redirect)
            from <strong>{apex}</strong> to <strong>https://{candidate.hostname}</strong> so they reach your
            site too.
          </p>
        </div>
      ) : null}
    </section>
  );
}
