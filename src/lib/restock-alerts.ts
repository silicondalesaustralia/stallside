/** Kill-switch: set RESTOCK_ALERTS_ENABLED=0 to hide UI and block sends. */
export function isRestockAlertsEnabled(): boolean {
  return process.env.RESTOCK_ALERTS_ENABLED !== "0";
}

/** Exact wording shown at opt-in - stored as consentText. */
export const RESTOCK_CONSENT_TEXT =
  "Want to hear when this stand restocks? Join the list - unsubscribe anytime. Nothing else.";

export const RESTOCK_CONSENT_SOURCE = "checkout_success";

/** 0 = no cooldown (open for testing). Set back to LOW_STOCK_ALERT_COOLDOWN_HOURS later. */
export const RESTOCK_ALERT_COOLDOWN_HOURS = 0;
