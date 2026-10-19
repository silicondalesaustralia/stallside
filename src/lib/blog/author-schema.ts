import type { BlogAuthor } from "@/generated/prisma/client";
import { SITE_URL } from "@/lib/legal";
import { newsOrganizationSchema, newsWebsiteSchema } from "@/lib/farms-stand-news/schema-base";
import { authorPersonNode } from "@/lib/farms-stand-news/schema-person";
import type { NewsArticle } from "@/lib/farms-stand-news/types";
import { newsArticlePath } from "@/lib/farms-stand-news/paths";
import { blogAuthorToNewsAuthor } from "./authors";
import { authorPath, authorsIndexPath } from "./paths";

/** ProfilePage graph whose Person @id matches the one on every article by this author. */
export function authorProfileGraphSchema(author: BlogAuthor, articles: NewsArticle[]) {
  const pageUrl = `${SITE_URL}${authorPath(author.slug)}`;
  const person = authorPersonNode(blogAuthorToNewsAuthor(author));
  if (!person) throw new Error("Author profile requires an active person author");

  return {
    "@context": "https://schema.org",
    "@graph": [
      newsWebsiteSchema(),
      newsOrganizationSchema(),
      { ...person, description: author.bio || author.shortBio },
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${author.name}, ${author.jobTitle}`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": person["@id"] },
        dateCreated: author.createdAt.toISOString(),
        dateModified: author.updatedAt.toISOString(),
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: "en-AU",
        ...(articles.length
          ? {
              hasPart: articles.slice(0, 20).map((article) => ({
                "@type": "BlogPosting",
                "@id": `${SITE_URL}${article.canonicalPath ?? newsArticlePath(article.slug)}#article`,
                headline: article.title,
                url: `${SITE_URL}${article.canonicalPath ?? newsArticlePath(article.slug)}`,
                datePublished: article.publishedAt,
                author: { "@id": person["@id"] },
              })),
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Authors", item: `${SITE_URL}${authorsIndexPath()}` },
          { "@type": "ListItem", position: 3, name: author.name, item: pageUrl },
        ],
      },
    ],
  };
}
