import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/legal";
import type { CouncilDirectoryFile } from "./council";
import {
  councilsPageDescription,
  councilsPageTitle,
} from "./copy";
import {
  AU_HUB_PATH,
  councilsPath,
  jurisdictionPathFor,
} from "./paths";
import type { JurisdictionRecord } from "./types";

export function jurisdictionHubSchema(opts: {
  name: string;
  description: string;
  items: { name: string; slug: string; urlPath: string }[];
  hubPath?: string;
  aboutName?: string;
  itemListName?: string;
  inLanguage?: string;
}) {
  const hubPath = opts.hubPath ?? AU_HUB_PATH;
  const url = `${SITE_URL}${hubPath}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: opts.name,
        description: opts.description,
        inLanguage: opts.inLanguage ?? "en-AU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        about: {
          "@type": "Thing",
          name:
            opts.aboutName ??
            "Home-based food business regulation in Australia",
        },
        mainEntity: { "@id": `${url}#itemlist` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        name: opts.itemListName ?? "Australian jurisdictions",
        numberOfItems: opts.items.length,
        itemListElement: opts.items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          url: `${SITE_URL}${item.urlPath}`,
        })),
      },
    ],
  };
}

export function councilsDirectorySchema(
  record: JurisdictionRecord,
  directory?: CouncilDirectoryFile | null,
) {
  const path = councilsPath(record.slug);
  const url = `${SITE_URL}${path}`;
  const parentUrl = `${SITE_URL}${jurisdictionPathFor(record)}`;
  const breadcrumbId = `${url}#breadcrumb`;
  const councils = directory?.councils ?? [];
  const verified = councils.filter(
    (c) => c.food_business_page || c.notification_form_url,
  );

  const graph: Record<string, unknown>[] = [
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: councilsPageTitle(record),
      description: councilsPageDescription(record),
      inLanguage: "en-AU",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      breadcrumb: { "@id": breadcrumbId },
      about: {
        "@type": "AdministrativeArea",
        name: record.name,
        containedInPlace: { "@type": "Country", name: "Australia" },
      },
      ...(verified.length
        ? { mainEntity: { "@id": `${url}#itemlist` } }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sell food from home",
          item: `${SITE_URL}${AU_HUB_PATH}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: record.name,
          item: parentUrl,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Councils",
          item: url,
        },
      ],
    },
  ];

  if (verified.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      name: `${record.name} councils with food-business pages`,
      numberOfItems: verified.length,
      itemListElement: verified.map((c, i) => {
        const itemUrl =
          c.notification_form_url ||
          c.food_business_page ||
          c.enforcement_agency_url ||
          c.website;
        const orgId = `${url}#${c.slug}`;
        const org: Record<string, unknown> = {
          "@type": "GovernmentOrganization",
          "@id": orgId,
          name: c.name,
          url: itemUrl || undefined,
          ...(c.website ? { sameAs: c.website } : {}),
        };
        if (c.street_address) {
          org.address = {
            "@type": "PostalAddress",
            streetAddress: c.street_address,
            addressLocality: c.suburb || undefined,
            postalCode: c.postcode || undefined,
            addressRegion: "SA",
            addressCountry: "AU",
          };
        }
        const phone = c.eho_phone || c.phone;
        const email = c.eho_email || c.email;
        if (phone || email) {
          org.contactPoint = {
            "@type": "ContactPoint",
            contactType: c.enforcement_agency
              ? "food business notification"
              : "customer service",
            ...(phone ? { telephone: phone } : {}),
            ...(email ? { email } : {}),
            ...(c.enforcement_agency
              ? { name: c.enforcement_agency }
              : {}),
          };
        }
        graph.push(org);
        return {
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: { "@id": orgId },
          url: itemUrl,
        };
      }),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
