import { isLikelyApexHostname } from "@/lib/domains/normalize";
import { defaultCnameInstructions } from "@/lib/domains/provider/cloudflare";
import type { DnsRecord } from "./DnsRecordsList";

export type DomainDnsInput = {
  hostname: string;
  cnameTarget: string | null;
  verificationMethod: string | null;
  verificationName: string | null;
  verificationValue: string | null;
};

const WWW_HINT =
  "Use Name www (or the full host your DNS panel expects). If a record already exists for this name, edit it — don’t add a duplicate. Proxy/CDN should be DNS only (grey cloud) if you use Cloudflare.";

const APEX_HINT =
  "Name @ means the bare domain. Cloudflare accepts a CNAME here and flattens it automatically (keep it DNS only, grey cloud). Namecheap and others: choose ALIAS or ANAME if CNAME isn’t allowed on @. Remove any existing A or AAAA records on @ first.";

/** Registrable root for a connected host: the host itself if bare, else drop the first label. */
function rootDomain(hostname: string): string {
  return isLikelyApexHostname(hostname) ? hostname : hostname.split(".").slice(1).join(".");
}

/** `_cf-custom-hostname.www.example.com` → `_cf-custom-hostname.www` (most DNS panels add the domain). */
function shortName(fqdn: string, root: string): string {
  const name = fqdn.trim().toLowerCase().replace(/\.$/, "");
  return name.endsWith(`.${root}`) ? name.slice(0, -(root.length + 1)) : name;
}

export function buildDnsRecords(domain: DomainDnsInput): DnsRecord[] {
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
    const root = rootDomain(domain.hostname);
    records.push({
      label: "1. Ownership check (required first)",
      hint: `Proves you control this domain. Enter the Name exactly as shown — your DNS panel adds .${root} itself. If it asks for the full name, use ${ownershipName}.`,
      type: method === "txt" ? "TXT" : "CNAME",
      name: shortName(ownershipName!, root),
      value: ownershipValue!,
    });
  }

  records.push({
    label: ownershipLooksSeparate ? "2. Point your domain at Vendl" : "Point your domain at Vendl",
    hint: traffic.name === "@" ? APEX_HINT : WWW_HINT,
    type: traffic.name === "@" ? "CNAME (or ALIAS / ANAME)" : "CNAME",
    name: traffic.name,
    value: target,
  });

  return records;
}
