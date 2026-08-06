import {
  APP_NAME,
  APP_SEO_DESCRIPTION,
  APP_TAGLINE,
} from "@/lib/constants";
import { SITE_URL } from "@/lib/legal";

export const NEWS_SOCIAL_SAME_AS = [
  "https://www.facebook.com/Stallsideapp",
  "https://www.instagram.com/stallsideapp/",
  "https://www.youtube.com/@Stallside",
  "https://www.tiktok.com/@stallsideapp",
] as const;

export function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl}`;
}

export function newsOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: APP_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/brand/app-icon.png`,
      width: 512,
      height: 512,
      caption: APP_NAME,
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
