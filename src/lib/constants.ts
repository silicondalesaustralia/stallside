export const APP_NAME = "Stallside";
export const APP_DOMAIN = "stallside.app";
export const APP_TAGLINE = "Scan, Pay, Sold.";
export const APP_POSITIONING = "Checkout for anything nobody's minding.";
/** Cash plan — live */
export const CASH_PLAN_CENTS = 699;
/** Card plan — coming soon (waitlist only) */
export const CARD_PLAN_CENTS = 1999;
/** @deprecated use CASH_PLAN_CENTS */
export const MONTHLY_FEE_CENTS = CASH_PLAN_CENTS;
/** No transaction fees — ever */
export const PLATFORM_FEE_BPS = 0;
export const LOW_STOCK_ALERT_COOLDOWN_HOURS = 6;
export const DEFAULT_CURRENCY = "AUD";

export const CURRENCIES = [
  "AUD",
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "NZD",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];
