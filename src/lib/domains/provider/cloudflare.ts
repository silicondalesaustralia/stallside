import {
  cloudflareConfigured,
  cloudflareSaasCnameTarget,
} from "../config";

export type CloudflareCustomHostnameResult = {
  id: string;
  hostname: string;
  status: string;
  sslStatus: string | null;
  verificationErrors: string[];
  ownershipVerification: {
    type: string | null;
    name: string | null;
    value: string | null;
  } | null;
};

function cfHeaders(): HeadersInit {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function zoneBase(): string {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  if (!zoneId) throw new Error("CLOUDFLARE_ZONE_ID is not set");
  return `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`;
}

function mapResult(raw: Record<string, unknown>): CloudflareCustomHostnameResult {
  const ssl = (raw.ssl as Record<string, unknown> | null) ?? null;
  const ownership = (raw.ownership_verification as Record<string, unknown> | null) ?? null;
  const errors = Array.isArray(raw.verification_errors)
    ? (raw.verification_errors as unknown[]).map(String)
    : [];
  return {
    id: String(raw.id ?? ""),
    hostname: String(raw.hostname ?? ""),
    status: String(raw.status ?? "unknown"),
    sslStatus: ssl?.status != null ? String(ssl.status) : null,
    verificationErrors: errors,
    ownershipVerification: ownership
      ? {
          type: ownership.type != null ? String(ownership.type) : null,
          name: ownership.name != null ? String(ownership.name) : null,
          value: ownership.value != null ? String(ownership.value) : null,
        }
      : null,
  };
}

async function parseCfJson(res: Response): Promise<Record<string, unknown>> {
  const body = (await res.json()) as {
    success?: boolean;
    errors?: { message?: string; code?: number }[];
    result?: Record<string, unknown> | Record<string, unknown>[];
  };
  if (!res.ok || body.success === false) {
    const msg =
      body.errors?.[0]?.message ??
      `Cloudflare API error (${res.status})`;
    throw new Error(msg);
  }
  return (body.result as Record<string, unknown>) ?? {};
}

/** Create a Cloudflare for SaaS custom hostname. */
export async function cloudflareCreateCustomHostname(
  hostname: string,
): Promise<CloudflareCustomHostnameResult> {
  if (!cloudflareConfigured()) {
    throw new Error("Cloudflare custom hostnames are not configured");
  }
  const res = await fetch(zoneBase(), {
    method: "POST",
    headers: cfHeaders(),
    body: JSON.stringify({
      hostname,
      ssl: { method: "txt", type: "dv" },
    }),
  });
  const result = await parseCfJson(res);
  return mapResult(result);
}

export async function cloudflareGetCustomHostname(
  id: string,
): Promise<CloudflareCustomHostnameResult> {
  if (!cloudflareConfigured()) {
    throw new Error("Cloudflare custom hostnames are not configured");
  }
  const res = await fetch(`${zoneBase()}/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: cfHeaders(),
  });
  const result = await parseCfJson(res);
  return mapResult(result);
}

export async function cloudflareDeleteCustomHostname(id: string): Promise<void> {
  if (!cloudflareConfigured()) {
    throw new Error("Cloudflare custom hostnames are not configured");
  }
  const res = await fetch(`${zoneBase()}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: cfHeaders(),
  });
  if (!res.ok && res.status !== 404) {
    await parseCfJson(res);
  }
}

export function defaultCnameInstructions(hostname: string): {
  type: "CNAME";
  name: string;
  value: string;
} {
  const labels = hostname.split(".");
  // Apex (example.com): CNAME/ALIAS @ → customers.vendl.app (CF flattening).
  // Subdomain (shop.example.com): CNAME shop → customers.vendl.app.
  const name =
    labels.length === 2 ||
    (labels.length === 3 &&
      ["com.au", "co.uk", "com", "net", "org", "co"].includes(
        labels.slice(-2).join("."),
      ) &&
      labels[0] !== "www" &&
      labels[0] !== "shop" &&
      labels[0] !== "store")
      ? "@"
      : labels.length > 2
        ? labels[0]!
        : "www";
  return {
    type: "CNAME",
    name,
    value: cloudflareSaasCnameTarget(),
  };
}

/** True when Cloudflare reports both hostname and SSL active. */
export function cloudflareHostnameProductionReady(
  result: CloudflareCustomHostnameResult,
): boolean {
  return (
    result.status.toLowerCase() === "active" &&
    (result.sslStatus ?? "").toLowerCase() === "active"
  );
}
