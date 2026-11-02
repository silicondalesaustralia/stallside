import type { TrackingIds } from "./types";

const q = (value: string) => JSON.stringify(value);

type ConsentKey = "ad_storage" | "ad_user_data" | "ad_personalization" | "analytics_storage";

export function consentState(granted: boolean): Record<ConsentKey, "granted" | "denied"> {
  const value = granted ? "granted" : "denied";
  return { ad_storage: value, ad_user_data: value, ad_personalization: value, analytics_storage: value };
}

export function hasGoogleTags(ids: TrackingIds): boolean {
  return Boolean(ids.ga4Id || ids.googleAdsId || ids.gtmId);
}

/**
 * Consent Mode v2 defaults, then gtag.js and/or GTM. Runs before any Google tag, so
 * denied visitors only send cookieless pings until they accept.
 */
export function googleBootstrapSnippet(ids: TrackingIds, consentNeeded: boolean, granted: boolean): string {
  const lines = [
    "window.dataLayer=window.dataLayer||[];",
    "window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};",
  ];
  if (consentNeeded) {
    lines.push(`gtag('consent','default',${JSON.stringify({ ...consentState(granted), wait_for_update: 500 })});`);
  }
  const gtagIds = [ids.ga4Id, ids.googleAdsId].filter((id): id is string => Boolean(id));
  if (gtagIds.length > 0) {
    lines.push(
      "gtag('js',new Date());",
      ...gtagIds.map((id) => `gtag('config',${q(id)});`),
      `(function(d){var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+${q(gtagIds[0])};d.head.appendChild(s);})(document);`,
    );
  }
  if (ids.gtmId) {
    lines.push(
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${q(ids.gtmId)});`,
    );
  }
  return lines.join("\n");
}

export function googleConsentUpdateSnippet(granted: boolean): string {
  return `window.gtag&&window.gtag('consent','update',${JSON.stringify(consentState(granted))});`;
}
