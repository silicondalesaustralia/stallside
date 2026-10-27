import {
  cfHeaders,
  cloudflareCreateCustomHostname,
  cloudflareRefreshCustomHostname,
  mapResult,
  zoneBase,
  type CloudflareCustomHostnameResult,
} from "./cloudflare";

function isDuplicateHostnameError(e: unknown): boolean {
  return e instanceof Error && /duplicate custom hostname/i.test(e.message);
}

/** Look up an existing custom hostname in the SaaS zone by exact name. */
export async function cloudflareFindCustomHostname(
  hostname: string,
): Promise<CloudflareCustomHostnameResult | null> {
  const url = `${zoneBase()}?hostname=${encodeURIComponent(hostname)}`;
  const res = await fetch(url, { method: "GET", headers: cfHeaders() });
  const body = (await res.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: Record<string, unknown>[];
  };
  if (!res.ok || body.success === false) {
    throw new Error(body.errors?.[0]?.message ?? `Cloudflare API error (${res.status})`);
  }
  const match = (body.result ?? []).find(
    (row) => String(row.hostname ?? "").toLowerCase() === hostname.toLowerCase(),
  );
  return match ? mapResult(match) : null;
}

/**
 * Create the custom hostname, or adopt the one already in the zone (left by a
 * manual add, staging, or a disconnect whose delete failed). Callers must have
 * already checked no other Vendl store owns the hostname.
 */
export async function cloudflareEnsureCustomHostname(
  hostname: string,
): Promise<CloudflareCustomHostnameResult> {
  try {
    return await cloudflareCreateCustomHostname(hostname);
  } catch (e) {
    if (!isDuplicateHostnameError(e)) throw e;
    const existing = await cloudflareFindCustomHostname(hostname);
    if (!existing) throw e;
    try {
      return await cloudflareRefreshCustomHostname(existing.id);
    } catch {
      return existing;
    }
  }
}
