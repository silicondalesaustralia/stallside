/**
 * Minimal DataForSEO client. Calls go direct, or through DATAFORSEO_RELAY_URL when the account's
 * IP allowlist means requests must leave from a fixed address.
 */
const DIRECT_BASE = "https://api.dataforseo.com/v3";
const OK = 20000;

export const AU_LOCATION = { location_code: 2036, language_code: "en" } as const;

type DfsTask<T> = { status_code?: number; status_message?: string; cost?: number; result?: T[] | null };
type DfsResponse<T> = { status_code?: number; status_message?: string; tasks?: DfsTask<T>[] };

export function hasDataForSeo(): boolean {
  return Boolean(process.env.DATAFORSEO_RELAY_URL || (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD));
}

function request(path: string): { url: string; headers: Record<string, string> } {
  const relay = process.env.DATAFORSEO_RELAY_URL?.replace(/\/$/, "");
  if (relay) {
    return { url: `${relay}/v3/${path}`, headers: { "x-relay-secret": process.env.DATAFORSEO_RELAY_SECRET ?? "" } };
  }
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  return { url: `${DIRECT_BASE}/${path}`, headers: { Authorization: `Basic ${auth}` } };
}

/** POST one task and return its first result, or null on any failure (callers treat the data as optional). */
export async function dfsTask<T>(path: string, task: Record<string, unknown>): Promise<T | null> {
  if (!hasDataForSeo()) return null;
  try {
    const { url, headers } = request(path);
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify([task]),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as DfsResponse<T>;
    const first = json.tasks?.[0];
    if (json.status_code !== OK || first?.status_code !== OK) {
      throw new Error(first?.status_message ?? json.status_message ?? "unknown error");
    }
    console.log(`[dataforseo] ${path} cost $${first.cost ?? 0}`);
    return first.result?.[0] ?? null;
  } catch (error) {
    console.error(`[dataforseo] ${path} failed`, error instanceof Error ? error.message : error);
    return null;
  }
}
