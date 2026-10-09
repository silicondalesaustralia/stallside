/** Low-level Namecheap XML API client (secrets never logged). */

import {
  namecheapApiKey,
  namecheapApiUrl,
  namecheapApiUser,
  namecheapClientIp,
  namecheapConfigured,
  namecheapUsername,
} from "./config";
import { proxiedFetch } from "../proxied-fetch";

export class NamecheapApiError extends Error {
  constructor(
    message: string,
    readonly status: string | number,
    readonly body: string,
  ) {
    super(message);
    this.name = "NamecheapApiError";
  }
}

function requireCreds() {
  if (!namecheapConfigured()) {
    throw new NamecheapApiError("Namecheap not configured", 0, "");
  }
  return {
    ApiUser: namecheapApiUser()!,
    ApiKey: namecheapApiKey()!,
    UserName: namecheapUsername()!,
    ClientIp: namecheapClientIp()!,
  };
}

export async function namecheapCall(
  command: string,
  params: Record<string, string> = {},
): Promise<string> {
  const creds = requireCreds();
  const url = new URL(namecheapApiUrl());
  url.searchParams.set("ApiUser", creds.ApiUser);
  url.searchParams.set("ApiKey", creds.ApiKey);
  url.searchParams.set("UserName", creds.UserName);
  url.searchParams.set("ClientIp", creds.ClientIp);
  url.searchParams.set("Command", command);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await proxiedFetch(url.toString(), {
    method: "GET",
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new NamecheapApiError(`HTTP ${res.status}`, res.status, text);
  }
  const status = attr(text, "ApiResponse", "Status") || "";
  if (status.toUpperCase() !== "OK") {
    const errNum = firstMatch(text, /Number="([^"]+)"/) || status;
    const errMsg =
      firstMatch(text, /<Error[^>]*>([^<]*)<\/Error>/) ||
      firstMatch(text, /Description="([^"]*)"/) ||
      "Namecheap error";
    throw new NamecheapApiError(errMsg, errNum, text);
  }
  return text;
}

export function attr(
  xml: string,
  tag: string,
  name: string,
): string | undefined {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`, "i");
  return firstMatch(xml, re);
}

export function allTagAttrs(
  xml: string,
  tag: string,
): Array<Record<string, string>> {
  const re = new RegExp(`<${tag}\\b([^>]*)\\/?>`, "gi");
  const out: Array<Record<string, string>> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const attrs: Record<string, string> = {};
    const part = m[1] || "";
    const ar = /(\w+)="([^"]*)"/g;
    let a: RegExpExecArray | null;
    while ((a = ar.exec(part))) {
      attrs[a[1]] = a[2];
    }
    out.push(attrs);
  }
  return out;
}

function firstMatch(text: string, re: RegExp): string | undefined {
  const m = text.match(re);
  return m?.[1];
}
