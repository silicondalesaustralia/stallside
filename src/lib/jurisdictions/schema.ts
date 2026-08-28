import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/legal";
import { pageDescription, pageTitle } from "./copy";
import {
  hubPathFor,
  jurisdictionPathFor,
} from "./paths";
import { MO_FAQS } from "./mo-faqs";
import { NSW_FAQS } from "./nsw-faqs";
import { NT_FAQS } from "./nt-faqs";
import { SA_FAQS } from "./sa-faqs";
import { TAS_FAQS } from "./tas-faqs";
import { VIC_FAQS } from "./vic-faqs";
import { WA_FAQS } from "./wa-faqs";
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

const FAQS_BY_CODE: Partial<Record<JurisdictionRecord["code"], typeof SA_FAQS>> = {
  sa: SA_FAQS,
  nsw: NSW_FAQS,
  vic: VIC_FAQS,
  wa: WA_FAQS,
  tas: TAS_FAQS,
  nt: NT_FAQS,
  mo: MO_FAQS,
};

export function faqsForJurisdiction(record: JurisdictionRecord) {
  return FAQS_BY_CODE[record.code] ?? [];
}

export function jurisdictionPageSchema(record: JurisdictionRecord) {
  const path = jurisdictionPathFor(record);
  const hubPath = hubPathFor(record);
  const url = `${SITE_URL}${path}`;
  const name = pageTitle(record);
  const description = pageDescription(record);
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const sameAs = AREA_SAME_AS[record.code];
  const countryName = record.country === "US" ? "United States" : "Australia";
  const hubLabel =
    record.country === "US" ? "Cottage food laws" : "Sell food from home";

  // FAQ copy may still render on-page; FAQPage schema waits for verified query demand.
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
        cssSelector: [".jurisdiction-title", ".jurisdiction-body p:first-of-type"],
      },
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

  return { "@context": "https://schema.org", "@graph": graph };
}
