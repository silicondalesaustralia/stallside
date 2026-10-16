import { dashCtaClass } from "@/components/DashPrimaryCta";
import { makePrimaryDomainAction } from "./actions";
import ApexPrimarySteps from "./ApexPrimarySteps";

type Row = { id: string; hostname: string; status: string; isPrimary: boolean };

/**
 * After a domain connects: a fallback "make primary" choice for domains that went
 * active without becoming primary, and — while www is primary — how to switch the
 * main address to the bare domain.
 */
export default function DomainPrimaryPrompts({ domains }: { domains: Row[] }) {
  const active = domains.filter((d) => d.status === "ACTIVE");
  if (active.length === 0) return null;
  const primary = active.find((d) => d.isPrimary);
  const candidate = primary ?? active.find((d) => d.hostname.startsWith("www.")) ?? active[0];
  const apex = primary?.hostname.startsWith("www.") ? primary.hostname.slice(4) : null;
  const apexRow = apex ? domains.find((d) => d.hostname === apex) : undefined;
  const choices = active.length > 1 ? active : [candidate];
  if (primary && (!apex || apexRow?.status === "ACTIVE")) return null;

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      {!primary ? (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">
            {choices.length > 1 ? "Choose your main address" : `Make ${candidate.hostname} your main address`}
          </p>
          <p className="text-sm text-[var(--muted)]">
            Your domain is connected. Your Vendl address, old stand links, printed QR codes
            {choices.length > 1 ? " and the other address" : ""} will all forward to the one you make primary.
          </p>
          <div className="flex flex-wrap gap-2">
            {choices.map((d) => (
              <form key={d.id} action={makePrimaryDomainAction}>
                <input type="hidden" name="domainId" value={d.id} />
                <button type="submit" className={dashCtaClass}>
                  {choices.length > 1 ? `Use ${d.hostname}` : "Make primary"}
                </button>
              </form>
            ))}
          </div>
        </div>
      ) : null}
      {primary && apex ? (
        <ApexPrimarySteps apex={apex} wwwHost={primary.hostname} apexStatus={apexRow?.status ?? null} />
      ) : null}
    </section>
  );
}
