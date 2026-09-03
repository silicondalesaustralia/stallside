import { dashCtaClass } from "@/components/DashPrimaryCta";
import DomainsCopyButton from "./DomainsCopyButton";
import {
  checkDomainAction,
  disconnectDomainAction,
  makePrimaryDomainAction,
} from "./actions";
import type { StorefrontDomainStatus } from "@/generated/prisma/client";

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
  verificationName: string | null;
  verificationValue: string | null;
  lastCheckedAt: Date | null;
  errorMessage: string | null;
};

export default function CustomDomainCard({ domain }: { domain: CustomDomainRow }) {
  const cnameName = domain.verificationName || "www";
  const cnameValue = domain.cnameTarget || "customers.vendl.app";

  return (
    <section className="dash-card flex max-w-lg flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
            {domain.hostname}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Status: {sellerStatus(domain.status)}
            {domain.isPrimary ? " · Primary" : ""}
          </p>
        </div>
      </div>

      {domain.status !== "ACTIVE" && domain.status !== "DISCONNECTED" ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
          <p className="font-semibold text-[var(--field)]">Add this DNS record</p>
          <dl className="mt-3 space-y-2 text-[var(--muted)]">
            <div className="flex justify-between gap-4">
              <dt>Type</dt>
              <dd className="font-mono text-[var(--field)]">CNAME</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Name</dt>
              <dd className="font-mono text-[var(--field)]">{cnameName}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt>Value</dt>
              <dd className="flex items-center gap-2 font-mono text-[var(--field)]">
                {cnameValue}
                <DomainsCopyButton value={cnameValue} />
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[var(--muted)]">
            DNS changes can take some time to appear. You can leave this page and come
            back later.
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
        {domain.status !== "DISCONNECTED" && domain.status !== "ACTIVE" ? (
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
