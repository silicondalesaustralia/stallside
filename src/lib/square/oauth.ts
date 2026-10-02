import { randomBytes } from "crypto";
import {
  squareApiBaseUrl,
  squareApplicationId,
  squareApplicationSecret,
  squareOAuthRedirectUri,
} from "@/lib/square/config";
import { squareOAuthScopeString } from "@/lib/square/scopes";
import { squareFetch } from "@/lib/square/client";

export function buildSquareAuthorizeUrl(state: string): string | null {
  const clientId = squareApplicationId();
  if (!clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    scope: squareOAuthScopeString(),
    session: "false",
    state,
    redirect_uri: squareOAuthRedirectUri(),
  });
  return `${squareApiBaseUrl()}/oauth2/authorize?${params.toString()}`;
}

export function createOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

type ObtainTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  merchant_id?: string;
  token_type?: string;
};

export async function exchangeSquareAuthCode(
  code: string,
): Promise<ObtainTokenResponse> {
  const clientId = squareApplicationId();
  const clientSecret = squareApplicationSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Square OAuth is not configured");
  }

  const res = await fetch(`${squareApiBaseUrl()}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Square-Version": "2025-01-23",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: squareOAuthRedirectUri(),
    }),
  });

  const json = (await res.json()) as ObtainTokenResponse & {
    errors?: { detail?: string }[];
  };
  if (!res.ok) {
    throw new Error(json.errors?.[0]?.detail ?? "Square token exchange failed");
  }
  return json;
}

export async function refreshSquareAccessToken(
  refreshToken: string,
): Promise<ObtainTokenResponse> {
  const clientId = squareApplicationId();
  const clientSecret = squareApplicationSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Square OAuth is not configured");
  }

  const res = await fetch(`${squareApiBaseUrl()}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Square-Version": "2025-01-23",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = (await res.json()) as ObtainTokenResponse & {
    errors?: { detail?: string }[];
  };
  if (!res.ok) {
    throw new Error(json.errors?.[0]?.detail ?? "Square token refresh failed");
  }
  return json;
}

export async function revokeSquareToken(accessToken: string): Promise<void> {
  const clientId = squareApplicationId();
  if (!clientId) return;
  try {
    await fetch(`${squareApiBaseUrl()}/oauth2/revoke`, {
      method: "POST",
      headers: {
        Authorization: `Client ${squareApplicationSecret() ?? ""}`,
        "Content-Type": "application/json",
        "Square-Version": "2025-01-23",
      },
      body: JSON.stringify({
        client_id: clientId,
        access_token: accessToken,
      }),
    });
  } catch {
    // Best-effort revoke on disconnect.
  }
}

export async function fetchSquareMerchant(accessToken: string) {
  return squareFetch<{
    merchant?: Array<{ id?: string; business_name?: string; currency?: string }>;
  }>("/v2/merchants/me", { accessToken });
}

export async function fetchSquareLocations(accessToken: string) {
  return squareFetch<{
    locations?: Array<{
      id?: string;
      name?: string;
      status?: string;
      currency?: string;
    }>;
  }>("/v2/locations", { accessToken });
}
