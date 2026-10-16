import type { ReactNode } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { cloudflareSaasCnameTarget } from "@/lib/domains/config";
import { connectDomainAction } from "./actions";
import ApexForwardSteps from "./ApexForwardSteps";

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[var(--field)]">{children}</span>;
}

/**
 * Shown while www is the main address: how to switch to the bare domain instead,
 * with "keep www and forward the bare domain" as the fallback.
 */
export default function ApexPrimarySteps({
  apex,
  wwwHost,
  apexStatus,
}: {
  apex: string;
  wwwHost: string;
  /** Status of the bare-domain row if it's already connected. */
  apexStatus: string | null;
}) {
  if (apexStatus === "ACTIVE") return null;

  if (apexStatus) {
    return (
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold">Finish connecting {apex}</p>
        <p className="text-[var(--muted)]">
          Add the records shown on the {apex} card below, then tap Check again. As soon as it
          shows Active, tap <strong>Make primary</strong> on it — {wwwHost} will then forward to{" "}
          {apex}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <p className="font-semibold">Use {apex} (without www) as your main address</p>
        <p className="mt-1 text-[var(--muted)]">
          Your main address is <Mono>{wwwHost}</Mono>. To switch to <Mono>{apex}</Mono>:
        </p>
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-[var(--muted)]">
        <li>
          <form action={connectDomainAction} className="inline">
            <input type="hidden" name="hostname" value={apex} />
            <button type="submit" className={dashCtaClass}>
              Connect {apex}
            </button>
          </form>
        </li>
        <li>
          At your DNS provider, add the records Vendl then shows. The main one points the bare
          domain (Name <Mono>@</Mono>) at <Mono>{cloudflareSaasCnameTarget()}</Mono>:
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <strong>Cloudflare:</strong> add a <Mono>CNAME</Mono> on <Mono>@</Mono> — Cloudflare
              flattens it automatically. Keep it DNS only (grey cloud).
            </li>
            <li>
              <strong>Namecheap:</strong> add an <Mono>ALIAS Record</Mono> on <Mono>@</Mono>.
            </li>
            <li>
              <strong>Others:</strong> use <Mono>ALIAS</Mono> or <Mono>ANAME</Mono> on{" "}
              <Mono>@</Mono>. If your provider has neither (GoDaddy, for example), keep www as your
              main address or move your DNS to Cloudflare (free).
            </li>
          </ul>
        </li>
        <li>
          Tap Check again until it shows Active, then tap <strong>Make primary</strong> on {apex}.{" "}
          {wwwHost}, your Vendl address and printed QR codes will all forward to it.
        </li>
      </ol>
      <details className="rounded-xl border border-[var(--line)] px-4 py-3">
        <summary className="cursor-pointer font-semibold text-[var(--field)]">
          Or keep {wwwHost} as your main address
        </summary>
        <p className="mt-2 text-[var(--muted)]">
          Add a permanent (301) redirect from <Mono>{apex}</Mono> to{" "}
          <Mono>https://{wwwHost}</Mono> so visitors who skip the www still reach your site:
        </p>
        <div className="mt-2">
          <ApexForwardSteps apex={apex} target={wwwHost} />
        </div>
      </details>
    </div>
  );
}
