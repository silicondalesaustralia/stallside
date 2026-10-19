import { SITE_URL } from "@/lib/legal";
import type { NewsAuthor } from "./types";
import { absoluteUrl } from "./schema-base";

const DEFAULT_KNOWS_ABOUT = [
  "Unattended retail",
  "QR code checkout",
  "Farm stand and roadside stall operations",
  "Small business payment processing",
];

/** Stable @id shared by article graphs and the author's ProfilePage. */
export function authorSchemaId(author: NewsAuthor) {
  if (author.kind === "organization") return `${SITE_URL}/#organization`;
  return author.profilePath
    ? `${SITE_URL}${author.profilePath}#person`
    : `${SITE_URL}/#/schema/person/${author.slug}`;
}

/** Person node, or null when the publisher organisation is credited. */
export function authorPersonNode(author: NewsAuthor) {
  if (author.kind === "organization") return null;
  const url = author.profilePath
    ? `${SITE_URL}${author.profilePath}`
    : (author.url ?? `${SITE_URL}/about`);
  return {
    "@type": "Person",
    "@id": authorSchemaId(author),
    name: author.name,
    url,
    description: author.bio,
    jobTitle: author.jobTitle,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    ...(author.imageUrl
      ? {
          image: {
            "@type": "ImageObject",
            "@id": `${url}#personimage`,
            url: absoluteUrl(author.imageUrl),
            caption: author.name,
          },
        }
      : {}),
    knowsAbout: author.knowsAbout?.length ? author.knowsAbout : DEFAULT_KNOWS_ABOUT,
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  };
}
