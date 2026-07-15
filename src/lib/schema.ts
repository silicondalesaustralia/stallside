import { APP_NAME, APP_POSITIONING, APP_TAGLINE } from "@/lib/constants";
import {
  LEGAL_ABN,
  LEGAL_ADDRESS,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
  SITE_URL,
} from "@/lib/legal";
import { CASH_PLAN_BY_CURRENCY, BILLING_CURRENCIES } from "@/lib/saas-pricing";

export type FaqItem = { question: string; answer: string };

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: APP_NAME,
    url: SITE_URL,
    email: LEGAL_EMAIL,
    taxID: LEGAL_ABN,
    identifier: {
      "@type": "PropertyValue",
      name: "ABN",
      value: LEGAL_ABN,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: LEGAL_ADDRESS.streetAddress,
      addressLocality: LEGAL_ADDRESS.addressLocality,
      addressRegion: LEGAL_ADDRESS.addressRegion,
      postalCode: LEGAL_ADDRESS.postalCode,
      addressCountry: LEGAL_ADDRESS.addressCountry,
    },
    parentOrganization: {
      "@type": "Organization",
      name: LEGAL_ENTITY,
      taxID: LEGAL_ABN,
    },
    logo: `${SITE_URL}/brand/app-icon.png`,
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: APP_NAME,
    description: `${APP_POSITIONING} ${APP_TAGLINE}`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-AU",
  };
}

export function softwareApplicationSchema() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "SaaS",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    description: `${APP_POSITIONING} QR self-checkout and inventory for unmanned farm stands.`,
    offers: BILLING_CURRENCIES.map((currency) => ({
      "@type": "Offer",
      price: (CASH_PLAN_BY_CURRENCY[currency] / 100).toFixed(2),
      priceCurrency: currency,
      description: "Cash plan per site, billed monthly",
    })),
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

export function faqPageSchema(faqs: FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function webPageSchema(opts: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  const type = opts.type ?? "WebPage";
  return {
    "@type": type,
    "@id": `${SITE_URL}${opts.path}#webpage`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-AU",
  };
}

export function homeGraphSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      softwareApplicationSchema(),
      faqPageSchema(faqs),
      webPageSchema({
        path: "/",
        name: `${APP_NAME} · ${APP_TAGLINE}`,
        description: `${APP_POSITIONING} ${APP_TAGLINE}`,
      }),
    ],
  };
}

export function marketingPageGraphSchema(opts: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema(opts),
    ],
  };
}
