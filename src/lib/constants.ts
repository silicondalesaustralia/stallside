export const APP_NAME = "Stallside";
export const APP_DOMAIN = "stallside.app";
export const APP_TAGLINE = "Scan, Pay, Sold.";
export const APP_POSITIONING =
  "Take payment at any unattended stand: produce, firewood, flowers, car parks, and anything else you leave out to sell.";
export const APP_HERO_SUPPORT =
  "Print a QR, get paid, track every sale from your phone.";

/** Cash plan AUD list price — prefer cashPlanCents(currency) */
export const CASH_PLAN_CENTS = 699;
/** Card plan AUD list price — prefer cardPlanCents(currency) */
export const CARD_PLAN_CENTS = 1999;
/** @deprecated use CASH_PLAN_CENTS */
export const MONTHLY_FEE_CENTS = CASH_PLAN_CENTS;
/** No transaction fees - ever */
export const PLATFORM_FEE_BPS = 0;
export const LOW_STOCK_ALERT_COOLDOWN_HOURS = 6;
/** Free app trial before card is required */
export const TRIAL_DAYS = 30;
/** Owner emails with free forever app access (ignore subscription status). */
export const COMPLIMENTARY_ACCESS_EMAILS = ["jono@silicondales.com"] as const;
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
