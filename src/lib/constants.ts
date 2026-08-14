export const APP_NAME = "Vendl";
/** Home-screen / lock-screen name on sale and stock pushes */
export const APP_DISPLAY_NAME = "Vendl.app";
export const APP_DOMAIN = "vendl.app";
export const APP_TAGLINE =
  "Your Farm Stand Or Pre-Order Business Will Make More Money With Vendl";
export const APP_POSITIONING =
  "Capture every walk-up sale, grow the basket with upsells, and sell ahead with pre-orders and subscriptions - from one QR.";
export const APP_HERO_SUPPORT =
  "Live in a minute. Cash and card from the start - plus every payment method in your region.";
/** Browser tab + search title for the homepage */
export const APP_SEO_TITLE =
  "Vendl · Make more money from your stall. No website needed.";
/** Meta description (~155 chars) */
export const APP_SEO_DESCRIPTION =
  "QR checkout for unattended stalls, pre-orders, and subscriptions. Upsells, stock alerts, cash and card - sell more without a website.";


/** @deprecated legacy Cash tier list price - prefer cashPlanCents(currency) */
export const CASH_PLAN_CENTS = 699;
/** Pro plan AUD list price - prefer cardPlanCents(currency) */
export const CARD_PLAN_CENTS = 1999;
/** @deprecated use CASH_PLAN_CENTS */
export const MONTHLY_FEE_CENTS = CASH_PLAN_CENTS;
/** @deprecated Free uses STALLSIDE_FEE_*; kept for old call sites */
export const PLATFORM_FEE_BPS = 0;
/** Vendl fee on Free plan Stripe card / Tap & Go (2.5%) */
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
