import { dashCtaClass } from "@/components/DashPrimaryCta";
import {
  checkDomainAction,
  disconnectDomainAction,
  makePrimaryDomainAction,
} from "./actions";
import type { StorefrontDomainStatus } from "@/generated/prisma/client";
import CloudflareTrustBadge from "./CloudflareTrustBadge";
import DnsRecordsList from "./DnsRecordsList";
import ManagedDnsNote from "./ManagedDnsNote";
import { buildDnsRecords } from "./domain-dns-records";

function sellerStatus(
  status: StorefrontDomainStatus,
  errorMessage: string | null,
  hostnameStatus: string | null,
  sslStatus: string | null,
): string {
  if (status === "ACTIVE") return "Active";
  if (status === "ERROR") return "Needs attention";
  if (status === "DISCONNECTED") return "Disconnected";
  if (errorMessage) return errorMessage;
  if (hostnameStatus && hostnameStatus.toLowerCase() !== "active") {
    return `Hostname: ${hostnameStatus}`;
  }
  if (sslStatus && sslStatus.toLowerCase() !== "active") {
    return `Certificate: ${sslStatus}`;
  }
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
  hostnameStatus: string | null;
  sslStatus: string | null;
};

export default function CustomDomainCard({
  domain,
  managed = false,
  canSwitchPrimary = false,
}: {
  domain: CustomDomainRow;
  /** Bought through Vendl: we manage its DNS, so bare domains are fine. */
  managed?: boolean;
  /** Another domain is already primary; otherwise DomainPrimaryPrompts owns the choice. */
  canSwitchPrimary?: boolean;
}) {
  const records = buildDnsRecords(domain);
  const waiting =
    domain.status !== "ACTIVE" && domain.status !== "DISCONNECTED";
  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
          {domain.hostname}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Status:{" "}
          {sellerStatus(
            domain.status,
            domain.errorMessage,
            domain.hostnameStatus,
            domain.sslStatus,
          )}
          {domain.isPrimary ? " · Primary" : ""}
        </p>
        {domain.hostnameStatus || domain.sslStatus ? (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Cloudflare hostname: {domain.hostnameStatus ?? "—"}
            {" · "}
            certificate: {domain.sslStatus ?? "—"}
          </p>
        ) : null}
      </div>

      {waiting && managed ? <ManagedDnsNote lastCheckedAt={domain.lastCheckedAt} /> : null}

      {waiting && !managed ? (
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
            DNS can take a few minutes to a few hours. You can leave and come back —
            then tap Check again.
            {domain.lastCheckedAt
              ? ` Last checked: ${domain.lastCheckedAt.toLocaleString()}.`
              : null}
          </p>
        </div>
      ) : null}

      {domain.errorMessage ? (
        <p className="text-sm text-[var(--gone)]">{domain.errorMessage}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {waiting ? (
          <form action={checkDomainAction}>
            <input type="hidden" name="domainId" value={domain.id} />
            <button type="submit" className={dashCtaClass}>
              Check again
            </button>
          </form>
        ) : null}
        {canSwitchPrimary && domain.status === "ACTIVE" && !domain.isPrimary ? (
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
