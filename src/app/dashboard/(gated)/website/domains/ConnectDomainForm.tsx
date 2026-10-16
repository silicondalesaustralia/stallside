import { dashCtaClass } from "@/components/DashPrimaryCta";
import { connectDomainAction } from "./actions";

const REGISTRARS = [
  { name: "Crazy Domains", href: "https://www.crazydomains.com.au" },
  { name: "VentraIP", href: "https://ventraip.com.au" },
  { name: "Namecheap", href: "https://www.namecheap.com" },
  { name: "GoDaddy", href: "https://www.godaddy.com/en-au" },
];

export default function ConnectDomainForm() {
  return (
    <form action={connectDomainAction} className="dash-card flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-3 text-sm text-[var(--muted)]">
        <p className="text-xs font-semibold uppercase tracking-wide">
          Connect an existing domain
        </p>
        <div>
          <p className="font-semibold text-[var(--field)]">
            1. Don&apos;t have a domain yet?
          </p>
          <p className="mt-1">
            Buy one from any reputable domain registrar, such as{" "}
            {REGISTRARS.map((r, i) => (
              <span key={r.name}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="underline">
                  {r.name}
                </a>
                {i < REGISTRARS.length - 2 ? ", " : i === REGISTRARS.length - 2 ? " or " : ""}
              </span>
            ))}
            . Any domain works — Australian (.com.au, .net.au), US and international
            (.com, .net, .us) or other regions around the world (.co.nz, .co.uk, .ca
            and more). For a .com.au or .net.au you&apos;ll need your ABN at checkout.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--field)]">2. Add it below</p>
          <p className="mt-1">
            Enter it with www in front, e.g.{" "}
            <span className="font-mono font-semibold text-[var(--field)]">
              www.yourfarm.com.au
            </span>{" "}
            — or{" "}
            <span className="font-mono text-[var(--field)]">shop.yourfarm.com.au</span>{" "}
            if your main website stays somewhere else.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--field)]">3. We&apos;ll guide you through setup</p>
          <p className="mt-1">
            Next we&apos;ll show you the exact records to copy into your registrar&apos;s
            DNS settings. It usually takes about 5 minutes, and your website is
            normally live within an hour (occasionally up to 24 hours).
          </p>
        </div>
        <p className="rounded-lg bg-[var(--line)]/40 p-3 text-xs">
          Start with www — it works with every DNS provider. Once it&apos;s live you can
          also connect the bare domain (yourfarm.com.au) and make that your main
          address if your DNS provider supports CNAME flattening, ALIAS or ANAME
          (Cloudflare and Namecheap do).
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Your domain</span>
        <input
          name="hostname"
          required
          placeholder="www.yourfarm.com.au"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <span className="text-xs text-[var(--muted)]">
          We recommend www or another subdomain (e.g. shop).
        </span>
      </label>
      <button type="submit" className={dashCtaClass}>
        Connect An Existing Domain
      </button>
    </form>
  );
}
