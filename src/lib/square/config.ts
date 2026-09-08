import { cleanEnvSecret } from "@/lib/env";
import { appBaseUrl } from "@/lib/app-url";

export type SquareEnvironment = "sandbox" | "production";

export function squareEnvironment(): SquareEnvironment {
  const raw = (process.env.SQUARE_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
  return raw === "production" ? "production" : "sandbox";
}

export function squareApiBaseUrl(): string {
  return squareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function squareApplicationId(): string | null {
  return cleanEnvSecret(process.env.SQUARE_APPLICATION_ID);
}

export function squareApplicationSecret(): string | null {
  return cleanEnvSecret(process.env.SQUARE_APPLICATION_SECRET);
}

export function squareWebhookSignatureKey(): string | null {
  return cleanEnvSecret(process.env.SQUARE_WEBHOOK_SIGNATURE_KEY);
}

export function squareOAuthRedirectUri(): string {
  const explicit = cleanEnvSecret(process.env.SQUARE_OAUTH_REDIRECT_URI);
  if (explicit) return explicit;
  return `${appBaseUrl()}/api/square/oauth/callback`;
}

export function isSquareIntegrationEnabled(): boolean {
  return process.env.SQUARE_INTEGRATION_ENABLED === "1";
}

export function isSquareConnectEnabled(): boolean {
  return (
    isSquareIntegrationEnabled() &&
    process.env.SQUARE_CONNECT_ENABLED !== "0" &&
    Boolean(squareApplicationId() && squareApplicationSecret())
  );
}

export function isSquarePaymentsEnabled(): boolean {
  return isSquareConnectEnabled() && process.env.SQUARE_PAYMENTS_ENABLED === "1";
}

export function isSquareAppFeesEnabled(): boolean {
  return (
    isSquarePaymentsEnabled() && process.env.SQUARE_APP_FEES_ENABLED === "1"
  );
}

export function isSquareCatalogEnabled(): boolean {
  return isSquareConnectEnabled() && process.env.SQUARE_CATALOG_ENABLED === "1";
}

export function isSquareInventoryEnabled(): boolean {
  return (
    isSquareConnectEnabled() && process.env.SQUARE_INVENTORY_ENABLED === "1"
  );
}

export function isSquarePosImportEnabled(): boolean {
  return (
    isSquareConnectEnabled() && process.env.SQUARE_POS_IMPORT_ENABLED === "1"
  );
}

/** Square API version header — pin for webhook + request consistency. */
export const SQUARE_API_VERSION = "2025-01-23";
