import { dashCtaClass } from "@/components/DashPrimaryCta";
import { connectDomainAction } from "./actions";

export default function ConnectDomainForm() {
  return (
    <form action={connectDomainAction} className="dash-card flex flex-col gap-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Connect an existing domain
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Enter your site as{" "}
          <span className="font-mono font-semibold text-[var(--field)]">
            www.yourfarm.com
          </span>{" "}
          (or{" "}
          <span className="font-mono text-[var(--field)]">shop.yourfarm.com</span> if
          the main site stays elsewhere).
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Don&apos;t enter the bare domain alone (yourfarm.com) — that can&apos;t be
          activated yet. After www works, add a redirect from yourfarm.com → www at
          your DNS host.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Hostname</span>
        <input
          name="hostname"
          required
          placeholder="www.yourfarm.com"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <span className="text-xs text-[var(--muted)]">
          Must include www or another subdomain (e.g. shop).
        </span>
      </label>
      <button type="submit" className={dashCtaClass}>
        Connect An Existing Domain
      </button>
    </form>
  );
}
