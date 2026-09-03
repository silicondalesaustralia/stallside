import { dashCtaClass } from "@/components/DashPrimaryCta";
import {
  checkDomainAction,
  disconnectDomainAction,
  makePrimaryDomainAction,
} from "./actions";
import type { StorefrontDomainStatus } from "@/generated/prisma/client";
import { isLikelyApexHostname } from "@/lib/domains/normalize";
import { defaultCnameInstructions } from "@/lib/domains/provider/cloudflare";
import CloudflareTrustBadge from "./CloudflareTrustBadge";
import DnsRecordsList, { type DnsRecord } from "./DnsRecordsList";

function sellerStatus(status: StorefrontDomainStatus): string {
  if (status === "ACTIVE") return "Active";
  if (status === "ERROR") return "Needs attention";
  if (status === "DISCONNECTED") return "Disconnected";
  return "Waiting for DNS";
}

export type CustomDomainRow = {
  id: string;
  hostname: string;
  status: StorefrontDomainStatus;
  isPrimary: boolean;
  cnameTarget: string | null;
  verificationMethod: string | null;
  verificationName: string | null;
  verificationValue: string | null;
  lastCheckedAt: Date | null;
  errorMessage: string | null;
};

function suggestedWww(hostname: string): string {
  if (hostname.startsWith("www.")) return hostname;
  return `www.${hostname}`;
}

function buildDnsRecords(domain: CustomDomainRow): DnsRecord[] {
  const traffic = defaultCnameInstructions(domain.hostname);
  const target = domain.cnameTarget || traffic.value;
  const records: DnsRecord[] = [];

  const ownershipName = domain.verificationName?.trim() || null;
  const ownershipValue = domain.verificationValue?.trim() || null;
  const method = (domain.verificationMethod || "cname").toLowerCase();
  const ownershipLooksSeparate =
    Boolean(ownershipName && ownershipValue) &&
    ownershipName !== traffic.name &&
    ownershipValue !== target;

  if (ownershipLooksSeparate) {
    records.push({
      label: "1. Ownership check (required first)",
      hint: "Proves you control this domain. Add exactly as shown.",
      type: method === "txt" ? "TXT" : "CNAME",
      name: ownershipName!,
      value: ownershipValue!,
    });
  }

  records.push({
    label: ownershipLooksSeparate
      ? "2. Point your domain at Vendl"
      : "Point your domain at Vendl",
    hint:
      "Use Name www (or the full host your DNS panel expects). If a record already exists for this name, edit it — don’t add a duplicate. Proxy/CDN should be DNS only (grey cloud) if you use Cloudflare.",
    type: "CNAME",
    name: traffic.name,
    value: target,
  });

  return records;
}

export default function CustomDomainCard({ domain }: { domain: CustomDomainRow }) {
  const records = buildDnsRecords(domain);
  const waiting =
    domain.status !== "ACTIVE" && domain.status !== "DISCONNECTED";
  const apex = isLikelyApexHostname(domain.hostname);
  const wwwHost = suggestedWww(domain.hostname);

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
          {domain.hostname}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Status: {sellerStatus(domain.status)}
          {domain.isPrimary ? " · Primary" : ""}
        </p>
      </div>

      {apex ? (
        <div className="rounded-xl border border-[var(--warn)]/40 bg-[var(--panel)] p-4 text-sm text-[var(--field)]">
          <p className="font-semibold">Use www for now</p>
          <p className="mt-2 text-[var(--muted)]">
            Bare domains like{" "}
            <span className="font-mono text-[var(--field)]">{domain.hostname}</span>{" "}
            can&apos;t finish setup yet. Disconnect this, then connect{" "}
            <span className="font-mono text-[var(--field)]">{wwwHost}</span>. You
            can redirect the bare domain to www at your DNS host so visitors still
            type the short address.
          </p>
        </div>
      ) : null}

      {waiting && !apex ? (
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <div>
            <p className="font-semibold text-[var(--field)]">
              Add these DNS records
            </p>
            <p className="mt-2 text-[var(--muted)]">
              Log in to wherever this domain&apos;s DNS is hosted (your registrar,
              Cloudflare, GoDaddy, Namecheap, Google Domains, etc.) and add the
              record{records.length > 1 ? "s" : ""} below. If someone else manages
              your domain, send them this page or copy the values for your
              webmaster.
            </p>
          </div>

          <CloudflareTrustBadge />
          <DnsRecordsList records={records} />

          <p className="text-xs text-[var(--muted)]">
            Optional: at your DNS host, redirect the bare domain (yourfarm.com) to
            this www address so both work for visitors.
          </p>
          <p className="text-xs text-[var(--muted)]">
            DNS can take a few minutes to a few hours. You can leave and come back —
            then tap Check again.
            {domain.lastCheckedAt
              ? ` Last checked: ${domain.lastCheckedAt.toLocaleString()}.`
              : null}
          </p>
        </div>
      ) : null}

      {domain.errorMessage && !apex ? (
        <p className="text-sm text-[var(--gone)]">{domain.errorMessage}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {waiting && !apex ? (
          <form action={checkDomainAction}>
            <input type="hidden" name="domainId" value={domain.id} />
            <button type="submit" className={dashCtaClass}>
              Check again
            </button>
          </form>
        ) : null}
        {domain.status === "ACTIVE" && !domain.isPrimary ? (
          <form action={makePrimaryDomainAction}>
            <input type="hidden" name="domainId" value={domain.id} />
            <button type="submit" className={dashCtaClass}>
              Make primary
            </button>
          </form>
        ) : null}
        {domain.status !== "DISCONNECTED" ? (
          <form action={disconnectDomainAction}>
            <input type="hidden" name="domainId" value={domain.id} />
            <button
              type="submit"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
            >
              Disconnect
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
