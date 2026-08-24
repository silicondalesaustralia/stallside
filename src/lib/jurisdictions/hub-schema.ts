import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/legal";
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

export function councilsDirectorySchema(record: JurisdictionRecord) {
  const path = councilsPath(record.slug);
  const url = `${SITE_URL}${path}`;
  const parentUrl = `${SITE_URL}${jurisdictionPathFor(record)}`;
  const breadcrumbId = `${url}#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: `${record.name} food business councils`,
        description: `Local councils for home-based food business notification or licensing in ${record.name}.`,
        inLanguage: "en-AU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": breadcrumbId },
        about: {
          "@type": "AdministrativeArea",
          name: record.name,
          containedInPlace: { "@type": "Country", name: "Australia" },
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
    ],
  };
}
