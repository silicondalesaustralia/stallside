import { APP_DOMAIN } from "@/lib/constants";

/** Canonical public origin for QR codes, Stripe redirects, magic links. */
export function appBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  const isLocal = !raw || /localhost|127\.0\.0\.1/i.test(raw);

  // Never bake localhost into QR codes on a production deploy.
  if (isProd && isLocal) {
    return `https://${APP_DOMAIN}`;
  }
  if (raw) return raw;
  return isProd ? `https://${APP_DOMAIN}` : "http://localhost:3000";
}
