/** Optional Fixie (or other) HTTP proxy for allowlisted egress. */

import { ProxyAgent, fetch as undiciFetch } from "undici";

export function fixieProxyUrl(): string | null {
  return process.env.FIXIE_URL?.trim() || null;
}

/** fetch() that routes through FIXIE_URL when set. */
export async function proxiedFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const proxy = fixieProxyUrl();
  if (!proxy) {
    return fetch(url, init);
  }
  const agent = new ProxyAgent(proxy);
  const res = await undiciFetch(url, {
    method: init?.method ?? "GET",
    headers: init?.headers as Record<string, string> | undefined,
    body: init?.body as string | undefined,
    signal: init?.signal as AbortSignal | undefined,
    dispatcher: agent,
  });
  return res as unknown as Response;
}
