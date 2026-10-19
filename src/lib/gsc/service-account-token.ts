import { createSign } from "crypto";
import { readFileSync } from "fs";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GSC_READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

type ServiceAccountKey = { client_email: string; private_key: string };

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function isServiceAccountKey(value: unknown): value is ServiceAccountKey {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.client_email === "string" && typeof v.private_key === "string";
}

/**
 * GSC_SERVICE_ACCOUNT_JSON: raw JSON or base64 JSON.
 * Fallback: GOOGLE_APPLICATION_CREDENTIALS file path.
 */
export function loadServiceAccountKey(): ServiceAccountKey {
  const inline = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  let raw: string;
  if (inline) {
    raw = inline.startsWith("{") ? inline : Buffer.from(inline, "base64").toString("utf8");
  } else if (path) {
    raw = readFileSync(path, "utf8");
  } else {
    throw new Error("Set GSC_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS");
  }
  const parsed: unknown = JSON.parse(raw);
  if (!isServiceAccountKey(parsed)) throw new Error("Service account JSON is missing client_email/private_key");
  return parsed;
}

/** OAuth2 JWT-bearer grant for a service account (no googleapis dependency). */
export async function getServiceAccountAccessToken(scope = GSC_READONLY_SCOPE): Promise<string> {
  const key = loadServiceAccountKey();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: key.client_email, scope, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(key.private_key));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token request failed (${res.status}): ${await res.text()}`);
  }
  const body: unknown = await res.json();
  const token = (body as { access_token?: unknown }).access_token;
  if (typeof token !== "string") throw new Error("Google token response had no access_token");
  return token;
}
