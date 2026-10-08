import { cleanEnvSecret } from "@/lib/env";
import { appBaseUrl } from "@/lib/app-url";
import type { SquareRegion } from "@/lib/square/region";

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

export function squareApplicationId(region: SquareRegion): string | null {
  return cleanEnvSecret(
    region === "US"
      ? process.env.SQUARE_US_APPLICATION_ID
      : process.env.SQUARE_APPLICATION_ID,
  );
}

export function squareApplicationSecret(region: SquareRegion): string | null {
  return cleanEnvSecret(
    region === "US"
      ? process.env.SQUARE_US_APPLICATION_SECRET
      : process.env.SQUARE_APPLICATION_SECRET,
  );
}

export function squareWebhookSignatureKey(region: SquareRegion): string | null {
  return cleanEnvSecret(
    region === "US"
      ? process.env.SQUARE_US_WEBHOOK_SIGNATURE_KEY
      : process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
  );
}

export function squareRegionHasApp(region: SquareRegion): boolean {
  return Boolean(squareApplicationId(region) && squareApplicationSecret(region));
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
    squareRegionHasApp("AU")
  );
}

/** Operator-facing checks (no secret values). */
export function squareConnectDiagnostics(): {
  vercelEnv: string;
  integrationEnabled: boolean;
  connectAllowed: boolean;
  hasApplicationId: boolean;
  hasApplicationSecret: boolean;
} {
  return {
    vercelEnv:
      process.env.VERCEL_ENV?.trim() ||
      process.env.NODE_ENV?.trim() ||
      "unknown",
    integrationEnabled: isSquareIntegrationEnabled(),
    connectAllowed: process.env.SQUARE_CONNECT_ENABLED !== "0",
    hasApplicationId: Boolean(squareApplicationId("AU")),
    hasApplicationSecret: Boolean(squareApplicationSecret("AU")),
  };
}

export function isSquarePaymentsEnabled(): boolean {
  return isSquareConnectEnabled() && process.env.SQUARE_PAYMENTS_ENABLED === "1";
}

export function isSquareAppFeesEnabled(): boolean {
  return (
    isSquarePaymentsEnabled() && process.env.SQUARE_APP_FEES_ENABLED === "1"
  );
}

/** Vendl-billed subscriptions and memberships charged to saved Square cards. */
export function isSquareSubscriptionsEnabled(): boolean {
  return (
    isSquarePaymentsEnabled() && process.env.SQUARE_SUBSCRIPTIONS_ENABLED === "1"
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
