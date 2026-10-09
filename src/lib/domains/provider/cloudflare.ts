import {
  cloudflareConfigured,
  cloudflareSaasCnameTarget,
} from "../config";

export type CloudflareSslTxtRecord = {
  name: string;
  value: string;
};

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
  sslTxtRecords: CloudflareSslTxtRecord[];
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

function mapSslTxtRecords(ssl: Record<string, unknown> | null): CloudflareSslTxtRecord[] {
  if (!ssl) return [];
  const raw = ssl.validation_records;
  if (!Array.isArray(raw)) return [];
  const out: CloudflareSslTxtRecord[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const name = rec.txt_name != null ? String(rec.txt_name) : "";
    const value = rec.txt_value != null ? String(rec.txt_value) : "";
    if (name && value) out.push({ name, value });
  }
  return out;
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
    sslTxtRecords: mapSslTxtRecords(ssl),
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

/** HTTP DCV once the hostname CNAMEs to the SaaS zone (no extra SSL TXT). */
const SSL_SETTINGS = { method: "http", type: "dv" } as const;

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
      ssl: SSL_SETTINGS,
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

/** PATCH refresh — re-runs hostname + certificate validation. */
export async function cloudflareRefreshCustomHostname(
  id: string,
): Promise<CloudflareCustomHostnameResult> {
  if (!cloudflareConfigured()) {
    throw new Error("Cloudflare custom hostnames are not configured");
  }
  const res = await fetch(`${zoneBase()}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: cfHeaders(),
    body: JSON.stringify({ ssl: SSL_SETTINGS }),
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

export function cloudflarePendingStatusLabel(
  result: Pick<CloudflareCustomHostnameResult, "status" | "sslStatus" | "verificationErrors">,
): string {
  const host = result.status.toLowerCase();
  const ssl = (result.sslStatus ?? "").toLowerCase();
  if (result.verificationErrors.length) {
    return result.verificationErrors[0] ?? "Waiting for DNS";
  }
  if (host !== "active") return "Waiting for DNS";
  if (ssl && ssl !== "active") return "Waiting for certificate";
  return "Waiting for DNS";
}
