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
  "CUSTOMERS_READ",
  "CUSTOMERS_WRITE",
] as const;

/** Needed to save shoppers' cards for subscriptions; older connections lack them. */
export const SQUARE_SUBSCRIPTION_SCOPES = ["CUSTOMERS_READ", "CUSTOMERS_WRITE"] as const;

export function squareOAuthScopeString(): string {
  return SQUARE_OAUTH_SCOPES.join(" ");
}

export function hasSquareSubscriptionScopes(granted: readonly string[]): boolean {
  return SQUARE_SUBSCRIPTION_SCOPES.every((scope) => granted.includes(scope));
}
