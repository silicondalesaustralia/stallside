import http from "node:http";
import https from "node:https";
import { lookup as dnsLookup } from "node:dns";
import type { LookupFunction } from "node:net";
import { checkPublicUrl, isBlockedAddress } from "./ip-guard";

const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

export type FetchPageResult =
  | { ok: true; finalUrl: string; html: string }
  | { ok: false; reason: string; blocked: boolean };

/** DNS lookup that refuses private addresses, so the check and the connection use the same IP. */
const guardedLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    const list = Array.isArray(addresses) ? addresses : [];
    const safe = list.find((a) => !isBlockedAddress(a.address));
    if (!safe || list.some((a) => isBlockedAddress(a.address))) {
      return callback(new Error("blocked_address"), "", 0);
    }
    if (options.all) return callback(null, [safe]);
    callback(null, safe.address, safe.family);
  });
};

type Hop = { status: number; location: string | null; contentType: string; body: string };

function requestOnce(url: URL): Promise<Hop> {
  const lib = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup,
        timeout: TIMEOUT_MS,
        headers: { "User-Agent": "VendlWebsiteAssistant/1.0 (+https://www.vendl.app)", Accept: "text/html" },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const contentType = String(res.headers["content-type"] ?? "");
        if (status >= 300 && status < 400) {
          res.resume();
          return resolve({ status, location: res.headers.location ?? null, contentType, body: "" });
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            req.destroy(new Error("too_large"));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => resolve({ status, location: null, contentType, body: Buffer.concat(chunks).toString("utf8") }));
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
}

/** Fetches a public HTML page with SSRF protection, manual redirects, size and time limits. */
export async function fetchPublicPage(raw: string): Promise<FetchPageResult> {
  let check = checkPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!check.ok) return { ok: false, reason: check.reason, blocked: true };
    let res: Hop;
    try {
      res = await requestOnce(check.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "blocked_address") return { ok: false, reason: "That address isn't a public website.", blocked: true };
      if (msg === "too_large") return { ok: false, reason: "That page is too large to read.", blocked: false };
      return { ok: false, reason: "We couldn't reach that page.", blocked: false };
    }
    if (res.location) {
      check = checkPublicUrl(new URL(res.location, check.url).toString());
      continue;
    }
    if (res.status < 200 || res.status >= 300) return { ok: false, reason: `That page returned an error (${res.status}).`, blocked: false };
    if (!/text\/html|application\/xhtml/i.test(res.contentType)) {
      return { ok: false, reason: "That address isn't a web page we can read.", blocked: false };
    }
    return { ok: true, finalUrl: check.url.toString(), html: res.body };
  }
  return { ok: false, reason: "That page redirects too many times.", blocked: false };
}
