import { NextResponse } from "next/server";
import { resolveActiveCustomHostname } from "@/lib/domains/resolve";
import { normalizeDomainHostname } from "@/lib/domains/normalize";
import {
  customDomainsRoutingEnabled,
  domainsInternalLookupSecret,
} from "@/lib/domains/config";

export const runtime = "nodejs";

/**
 * Internal hostname → tenant lookup for Edge middleware.
 * Protected by DOMAINS_INTERNAL_LOOKUP_SECRET when set.
 */
export async function GET(request: Request) {
  if (!customDomainsRoutingEnabled()) {
    return NextResponse.json({ error: "disabled" }, { status: 404 });
  }

  const secret = domainsInternalLookupSecret();
  if (secret) {
    const header = request.headers.get("x-vendl-internal");
    if (header !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const host = normalizeDomainHostname(url.searchParams.get("hostname"));
  if (!host) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const resolved = await resolveActiveCustomHostname(host);
  if (!resolved) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: resolved.slug,
    storefrontId: resolved.storefrontId,
    hostname: resolved.hostname,
    isPrimary: resolved.isPrimary,
  });
}
