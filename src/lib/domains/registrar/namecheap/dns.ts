/** Namecheap DNS for a Vendl-bought domain: www + bare domain → Cloudflare SaaS. */

import { namecheapCall } from "./client";
import { domainTld } from "./au-attrs";

export type DnsTxtRecord = { name: string; value: string };

/** `_cf-custom-hostname.www.example.com` → `_cf-custom-hostname.www` for apex `example.com`. */
export function relativeHostName(fqdn: string, apex: string): string | null {
  const name = fqdn.trim().toLowerCase().replace(/\.$/, "");
  const root = apex.trim().toLowerCase();
  if (name === root) return "@";
  if (!name.endsWith(`.${root}`)) return null;
  return name.slice(0, -(root.length + 1));
}

/**
 * setHosts params: www CNAME and bare-domain ALIAS to the SaaS target, plus any
 * Cloudflare ownership TXT records. setHosts replaces every existing record.
 */
export function namecheapStorefrontHostParams(
  apex: string,
  cnameTarget: string,
  txtRecords: DnsTxtRecord[] = [],
): Record<string, string> {
  const host = apex.trim().toLowerCase();
  const tld = domainTld(host);
  const target = cnameTarget.replace(/\.$/, "");
  const records: { name: string; type: string; address: string }[] = [
    { name: "www", type: "CNAME", address: target },
    { name: "@", type: "ALIAS", address: target },
  ];
  for (const txt of txtRecords) {
    const name = relativeHostName(txt.name, host);
    if (name && txt.value) records.push({ name, type: "TXT", address: txt.value });
  }

  const params: Record<string, string> = {
    SLD: host.slice(0, host.length - tld.length - 1),
    TLD: tld,
  };
  records.forEach((r, i) => {
    const n = i + 1;
    params[`HostName${n}`] = r.name;
    params[`RecordType${n}`] = r.type;
    params[`Address${n}`] = r.address;
    params[`TTL${n}`] = "300";
  });
  return params;
}

export async function namecheapSetStorefrontHosts(
  apex: string,
  cnameTarget: string,
  txtRecords: DnsTxtRecord[] = [],
): Promise<void> {
  await namecheapCall(
    "namecheap.domains.dns.setHosts",
    namecheapStorefrontHostParams(apex, cnameTarget, txtRecords),
  );
}
