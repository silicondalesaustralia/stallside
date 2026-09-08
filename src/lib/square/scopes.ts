/** Least-privilege OAuth scopes for shipped Square capabilities. */
export const SQUARE_OAUTH_SCOPES = [
  "MERCHANT_PROFILE_READ",
  "PAYMENTS_READ",
  "PAYMENTS_WRITE",
  "PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS",
  "ORDERS_READ",
  "ORDERS_WRITE",
  "ITEMS_READ",
  "ITEMS_WRITE",
  "INVENTORY_READ",
  "INVENTORY_WRITE",
] as const;

export function squareOAuthScopeString(): string {
  return SQUARE_OAUTH_SCOPES.join(" ");
}
