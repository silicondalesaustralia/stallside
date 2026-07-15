import { APP_DOMAIN } from "@/lib/constants";

export const LEGAL_ENTITY = "Saltbush Investment Trust";
export const LEGAL_ABN = "21 226 814 942";
export const LEGAL_EMAIL = "hello@stallside.app";

export const LEGAL_ADDRESS = {
  streetAddress: "41B Luck Street",
  addressLocality: "Macclesfield",
  addressRegion: "SA",
  postalCode: "5153",
  addressCountry: "AU",
} as const;

export const LEGAL_ADDRESS_LINE = `${LEGAL_ADDRESS.streetAddress}, ${LEGAL_ADDRESS.addressLocality}, ${LEGAL_ADDRESS.addressRegion} ${LEGAL_ADDRESS.postalCode}`;

export const SITE_URL = `https://${APP_DOMAIN}`;
