import { isIP } from "node:net";

function v4Parts(ip: string): number[] {
  return ip.split(".").map((p) => Number(p));
}

function privateV4(ip: string): boolean {
  const [a, b] = v4Parts(ip);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function privateV6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateV4(mapped[1]);
  return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v) || v.startsWith("64:ff9b:") || v.startsWith("2001:db8");
}

/** True for addresses an outbound fetch must never reach (loopback, private, link-local, metadata…). */
export function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return privateV4(ip);
  if (family === 6) return privateV6(ip);
  return true;
}

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Only plain http(s) on default ports, no credentials, no IP-literal private hosts. */
export function checkPublicUrl(raw: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return { ok: false, reason: "That doesn't look like a web address." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, reason: "Only web addresses can be imported." };
  if (url.username || url.password) return { ok: false, reason: "Web addresses with passwords can't be imported." };
  if (url.port && url.port !== "80" && url.port !== "443") return { ok: false, reason: "That address uses an unusual port." };
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal") || host === "localhost") {
    return { ok: false, reason: "That address isn't a public website." };
  }
  if (isIP(host) && isBlockedAddress(host)) return { ok: false, reason: "That address isn't a public website." };
  return { ok: true, url };
}
