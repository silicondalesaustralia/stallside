/**
 * Normalize a seller-entered or request hostname for storage/lookup.
 */
export function normalizeDomainHostname(raw: string | null | undefined): string {
  if (!raw) return "";
  let value = raw.trim().toLowerCase();
  if (!value) return "";

  // Strip protocol
  value = value.replace(/^https?:\/\//, "");
  // Strip path/query/hash
  value = value.split("/")[0] ?? "";
  value = value.split("?")[0] ?? "";
  value = value.split("#")[0] ?? "";
  // Strip credentials
  if (value.includes("@")) {
    value = value.slice(value.lastIndexOf("@") + 1);
  }
  // Strip port
  value = value.split(":")[0] ?? "";
  // Trailing dot
  value = value.replace(/\.$/, "");

  return value;
}

export function isValidCustomHostname(hostname: string): boolean {
  const host = normalizeDomainHostname(hostname);
  if (!host || host.length > 253) return false;
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (host.endsWith(".vercel.app")) return false;
  // Reject apex-only single label
  if (!host.includes(".")) return false;
  // Basic DNS label rules
  const labels = host.split(".");
  if (labels.length < 2) return false;
  return labels.every((label) => {
    if (!label || label.length > 63) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
    return /^[a-z0-9-]+$/.test(label);
  });
}

/** Apex (root) hostnames — Phase 9 v1 does not promise universal support. */
export function isLikelyApexHostname(hostname: string): boolean {
  const host = normalizeDomainHostname(hostname);
  const parts = host.split(".");
  // e.g. example.com / example.com.au / example.co.uk — heuristic only
  if (parts.length === 2) return true;
  if (parts.length === 3 && ["com", "net", "org", "co", "com.au"].includes(parts.slice(-2).join("."))) {
    return parts[0] !== "www" && parts[0] !== "shop" && parts[0] !== "store";
  }
  return false;
}
