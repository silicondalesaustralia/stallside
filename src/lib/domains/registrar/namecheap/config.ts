/** Namecheap API env helpers (never log secrets). */

export type NamecheapEnvironment = "sandbox" | "production";

export function namecheapEnvironment(): NamecheapEnvironment {
  const v = (process.env.NAMECHEAP_ENVIRONMENT || "sandbox").toLowerCase();
  return v === "production" || v === "live" ? "production" : "sandbox";
}

export function namecheapConfigured(): boolean {
  return Boolean(
    process.env.NAMECHEAP_API_USER?.trim() &&
      process.env.NAMECHEAP_API_KEY?.trim() &&
      process.env.NAMECHEAP_USERNAME?.trim() &&
      process.env.NAMECHEAP_CLIENT_IP?.trim(),
  );
}

export function namecheapApiUrl(): string {
  const env = namecheapEnvironment();
  if (env === "production") {
    return (
      process.env.NAMECHEAP_PRODUCTION_API_URL?.replace(/\/$/, "") ||
      "https://api.namecheap.com/xml.response"
    );
  }
  return (
    process.env.NAMECHEAP_SANDBOX_API_URL?.replace(/\/$/, "") ||
    "https://api.sandbox.namecheap.com/xml.response"
  );
}

export function namecheapApiUser(): string | null {
  return process.env.NAMECHEAP_API_USER?.trim() || null;
}

export function namecheapApiKey(): string | null {
  return process.env.NAMECHEAP_API_KEY?.trim() || null;
}

export function namecheapUsername(): string | null {
  return process.env.NAMECHEAP_USERNAME?.trim() || null;
}

export function namecheapClientIp(): string | null {
  return process.env.NAMECHEAP_CLIENT_IP?.trim() || null;
}
