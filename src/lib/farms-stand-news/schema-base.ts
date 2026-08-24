import {
  APP_DISPLAY_NAME,
  APP_NAME,
  APP_SEO_DESCRIPTION,
  APP_TAGLINE,
} from "@/lib/constants";
import { SITE_URL } from "@/lib/legal";

export const NEWS_SOCIAL_SAME_AS = [
  "https://www.facebook.com/vendlapp",
  "https://www.instagram.com/vendlapp/",
  "https://www.youtube.com/@vendlapp",
  "https://www.tiktok.com/@vendlapp",
] as const;

export function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl}`;
}

export function newsOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: APP_DISPLAY_NAME,
    alternateName: APP_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/brand/app-icon.png`,
      width: 512,
      height: 512,
      caption: APP_DISPLAY_NAME,
    },
    image: { "@id": `${SITE_URL}/#logo` },
    sameAs: [...NEWS_SOCIAL_SAME_AS],
  };
}

export function newsWebsiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: APP_NAME,
    description: APP_SEO_DESCRIPTION || APP_TAGLINE,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-AU",
  };
}
