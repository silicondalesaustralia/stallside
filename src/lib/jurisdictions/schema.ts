import { organizationSchema, websiteSchema, faqPageSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/legal";
import { pageDescription, pageTitle } from "./copy";
import {
  hubPathFor,
  jurisdictionPathFor,
} from "./paths";
import { SA_FAQS } from "./sa-faqs";
import type { JurisdictionRecord } from "./types";

const AREA_SAME_AS: Record<string, string> = {
  sa: "https://en.wikipedia.org/wiki/South_Australia",
  nsw: "https://en.wikipedia.org/wiki/New_South_Wales",
  vic: "https://en.wikipedia.org/wiki/Victoria_(state)",
  qld: "https://en.wikipedia.org/wiki/Queensland",
  wa: "https://en.wikipedia.org/wiki/Western_Australia",
  tas: "https://en.wikipedia.org/wiki/Tasmania",
  act: "https://en.wikipedia.org/wiki/Australian_Capital_Territory",
  nt: "https://en.wikipedia.org/wiki/Northern_Territory",
  fl: "https://en.wikipedia.org/wiki/Florida",
  mi: "https://en.wikipedia.org/wiki/Michigan",
  oh: "https://en.wikipedia.org/wiki/Ohio",
  sc: "https://en.wikipedia.org/wiki/South_Carolina",
  mo: "https://en.wikipedia.org/wiki/Missouri",
  ca: "https://en.wikipedia.org/wiki/California",
};

export function faqsForJurisdiction(record: JurisdictionRecord) {
  if (record.code === "sa") return SA_FAQS;
  return [];
}

export function jurisdictionPageSchema(record: JurisdictionRecord) {
  const path = jurisdictionPathFor(record);
  const hubPath = hubPathFor(record);
  const url = `${SITE_URL}${path}`;
  const name = pageTitle(record);
  const description = pageDescription(record);
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faqId = `${url}#faq`;
  const faqs = faqsForJurisdiction(record);
  const sameAs = AREA_SAME_AS[record.code];
  const countryName = record.country === "US" ? "United States" : "Australia";
  const hubLabel =
    record.country === "US" ? "Cottage food laws" : "Sell food from home";

  const graph: Record<string, unknown>[] = [
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name,
      description,
      dateModified: record.meta.last_verified,
      datePublished: record.meta.last_verified,
      inLanguage: record.country === "US" ? "en-US" : "en-AU",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      breadcrumb: { "@id": breadcrumbId },
      about: {
        "@type": "AdministrativeArea",
        name: record.name,
        containedInPlace: { "@type": "Country", name: countryName },
        ...(sameAs ? { sameAs } : {}),
      },
      mentions: [
        {
          "@type": "GovernmentOrganization",
          name: record.gate.regulator_primary,
          ...(record.contact.url ? { url: record.contact.url } : {}),
        },
        {
          "@type": "Legislation",
          name: record.law.statute,
          ...(record.law.statute_url && !record.law.statute_url.includes("[VERIFY")
            ? { url: record.law.statute_url }
            : {}),
          legislationJurisdiction: record.name,
        },
      ],
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [
          ".jurisdiction-title",
          ".jurisdiction-lead",
          ".jurisdiction-page .space-y-4 > p:first-of-type",
        ],
      },
      ...(faqs.length > 0 ? { mainEntity: { "@id": faqId } } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: hubLabel,
          item: `${SITE_URL}${hubPath}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: record.name,
          item: url,
        },
      ],
    },
  ];

  if (faqs.length > 0) {
    const faq = faqPageSchema(faqs) as Record<string, unknown>;
    faq["@id"] = faqId;
    faq.url = url;
    graph.push(faq);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
