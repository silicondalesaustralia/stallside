export const APP_NAME = "Stallside";
export const APP_DOMAIN = "vendl.app";
export const APP_TAGLINE = "Scan, Pay, Sold.";
export const APP_POSITIONING =
  "Take payment at any unattended stand: produce, firewood, flowers, car parks, and anything else you leave out to sell.";
export const APP_HERO_SUPPORT =
  "Print a QR, get paid, track every sale from your phone.";
/** Browser tab + search title for the homepage */
export const APP_SEO_TITLE =
  "Stallside · Checkout For Unattended Farm Stands & Stalls";
/** Meta description (~155 chars) */
export const APP_SEO_DESCRIPTION =
  "Free QR checkout for farm stands and honesty stalls. Cash and PayID free; card has a 2.5% Stallside fee - or go Pro to remove it.";

/** @deprecated legacy Cash tier list price - prefer cashPlanCents(currency) */
export const CASH_PLAN_CENTS = 699;
/** Pro plan AUD list price - prefer cardPlanCents(currency) */
export const CARD_PLAN_CENTS = 1999;
/** @deprecated use CASH_PLAN_CENTS */
export const MONTHLY_FEE_CENTS = CASH_PLAN_CENTS;
/** @deprecated Free uses STALLSIDE_FEE_*; kept for old call sites */
export const PLATFORM_FEE_BPS = 0;
/** Stallside fee on Free plan Stripe card / Tap & Go (2.5%) */
export const STALLSIDE_FEE_BPS = 250;
export const LOW_STOCK_ALERT_COOLDOWN_HOURS = 6;
/** Owner emails with free forever app access (ignore subscription status). */
export const COMPLIMENTARY_ACCESS_EMAILS = ["jono@silicondales.com"] as const;
/** Emails allowed to open platform admin (/admin). */
export const PLATFORM_ADMIN_EMAILS = ["jono@silicondales.com"] as const;
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
