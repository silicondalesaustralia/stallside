export const APP_NAME = "Stallside";
export const APP_DOMAIN = "stallside.app";
export const APP_TAGLINE = "Scan. Pay. Fresh.";
export const MONTHLY_FEE_CENTS = 999;
export const PLATFORM_FEE_BPS = 200;
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
