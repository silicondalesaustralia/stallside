import type { ReactNode } from "react";

type Provider = { name: string; steps: ReactNode[] };

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[var(--field)]">{children}</span>;
}

function providers(apex: string, target: string): Provider[] {
  const url = <Mono>https://{target}</Mono>;
  return [
    {
      name: "Cloudflare",
      steps: [
        <>
          DNS → Records → Add record: Type <Mono>A</Mono>, Name <Mono>@</Mono>, IPv4{" "}
          <Mono>192.0.2.1</Mono>, Proxy status <strong>Proxied</strong> (orange cloud). The IP is a
          placeholder — Cloudflare answers before it&apos;s used.
        </>,
        <>
          Rules → Redirect Rules → Create rule. When: Hostname equals <Mono>{apex}</Mono>. Then: Static
          redirect to {url}, status code <Mono>301</Mono>, tick Preserve query string. Deploy.
        </>,
        <>Leave the www CNAME as DNS only (grey cloud).</>,
      ],
    },
    {
      name: "Namecheap",
      steps: [
        <>Domain List → Manage → Advanced DNS (nameservers must be Namecheap BasicDNS).</>,
        <>
          Add new record: <Mono>URL Redirect Record</Mono>, Host <Mono>@</Mono>, Value {url}, type{" "}
          <strong>Permanent (301)</strong>. Save.
        </>,
      ],
    },
    {
      name: "GoDaddy",
      steps: [
        <>My Products → your domain → DNS → Forwarding → Add forwarding (Domain).</>,
        <>
          Forward to {url}, redirect type <strong>Permanent (301)</strong>, settings{" "}
          <strong>Forward only</strong>. Save.
        </>,
      ],
    },
    {
      name: "Other DNS providers",
      steps: [
        <>
          Look for &quot;Domain forwarding&quot;, &quot;URL redirect&quot; or &quot;Web forwarding&quot;.
        </>,
        <>
          Forward <Mono>{apex}</Mono> (host <Mono>@</Mono>) to {url} as a permanent (301) redirect.
          Don&apos;t change your www record.
        </>,
      ],
    },
  ];
}

/** Per-provider steps for redirecting the bare domain to the connected www host. */
export default function ApexForwardSteps({ apex, target }: { apex: string; target: string }) {
  return (
    <div className="flex flex-col gap-2">
      {providers(apex, target).map((p) => (
        <details
          key={p.name}
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm"
        >
          <summary className="cursor-pointer font-semibold text-[var(--field)]">{p.name}</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--muted)]">
            {p.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </details>
      ))}
      <p className="text-xs text-[var(--muted)]">
        Not sure who hosts your DNS? It&apos;s wherever you added the www CNAME record.
      </p>
    </div>
  );
}
