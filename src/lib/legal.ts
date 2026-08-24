import { APP_DISPLAY_NAME, APP_DOMAIN } from "@/lib/constants";

/** Public operator name used in schema and legal copy. */
export const LEGAL_ENTITY = APP_DISPLAY_NAME;
export const LEGAL_EMAIL = `hello@${APP_DOMAIN}`;

export const LEGAL_ADDRESS = {
  streetAddress: "41B Luck Street",
  addressLocality: "Macclesfield",
  addressRegion: "SA",
  postalCode: "5153",
  addressCountry: "AU",
} as const;

export const LEGAL_ADDRESS_LINE = `${LEGAL_ADDRESS.streetAddress}, ${LEGAL_ADDRESS.addressLocality}, ${LEGAL_ADDRESS.addressRegion} ${LEGAL_ADDRESS.postalCode}`;

export const SITE_URL = `https://${APP_DOMAIN}`;
