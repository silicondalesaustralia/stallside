import ApexPrimarySteps from "./ApexPrimarySteps";

type Row = { id: string; hostname: string; status: string; isPrimary: boolean };

/** While www is the main address: how to switch the main address to the bare domain. */
export default function DomainPrimaryPrompts({ domains }: { domains: Row[] }) {
  const primary = domains.find((d) => d.isPrimary && d.status === "ACTIVE");
  if (!primary?.hostname.startsWith("www.")) return null;
  const apex = primary.hostname.slice(4);
  const apexRow = domains.find((d) => d.hostname === apex);
  if (apexRow?.status === "ACTIVE") return null;

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <ApexPrimarySteps apex={apex} wwwHost={primary.hostname} apexStatus={apexRow?.status ?? null} />
    </section>
  );
}
