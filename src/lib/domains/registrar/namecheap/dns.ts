/** Namecheap DNS helpers for post-purchase www CNAME. */

import { namecheapCall } from "./client";
import { domainTld } from "./au-attrs";

/** Point www → Cloudflare SaaS CNAME target at Namecheap DNS. */
export async function namecheapSetWwwCname(
  apex: string,
  cnameTarget: string,
): Promise<void> {
  const host = apex.trim().toLowerCase();
  const tld = domainTld(host);
  const sld = host.slice(0, host.length - tld.length - 1);
  await namecheapCall("namecheap.domains.dns.setHosts", {
    SLD: sld,
    TLD: tld,
    HostName1: "www",
    RecordType1: "CNAME",
    Address1: cnameTarget.replace(/\.$/, ""),
    TTL1: "300",
  });
}
