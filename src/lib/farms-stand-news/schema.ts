import { SITE_URL } from "@/lib/legal";
import type { NewsArticleMeta } from "./types";
import { newsArticlePath, newsIndexPath } from "./paths";
import {
  absoluteUrl,
  newsOrganizationSchema,
  newsWebsiteSchema,
} from "./schema-base";
import { blogPostingNode } from "./schema-blog";
import { authorPersonNode, authorSchemaId } from "./schema-person";
import { appendComparisonNodes } from "./schema-comparison";

/** Full BlogPosting graph used by every farms-stand-news article. */
export function newsArticleGraphSchema(article: NewsArticleMeta) {
  const path = article.canonicalPath ?? newsArticlePath(article.slug);
  const postUrl = `${SITE_URL}${path}`;
  const datePublished = article.publishedAt;
  const dateModified = article.updatedAt ?? article.publishedAt;
  const authorId = authorSchemaId(article.author);
  const person = authorPersonNode(article.author);
  const imageUrl = article.image
    ? absoluteUrl(article.image.src)
    : undefined;
  const speakable =
    article.speakableSelectors ?? [".post-title", ".post-verdict"];

  const graph: Record<string, unknown>[] = [
    newsWebsiteSchema(),
    newsOrganizationSchema(),
    ...(person ? [person] : []),
    {
      "@type": "BreadcrumbList",
      "@id": `${postUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: article.sectionLabel ?? "Farm Stand News",
          item: `${SITE_URL}${article.sectionPath ?? newsIndexPath()}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: postUrl,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${postUrl}#webpage`,
      url: postUrl,
      name: article.title,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      ...(imageUrl
        ? { primaryImageOfPage: { "@id": `${postUrl}#primaryimage` } }
        : {}),
      datePublished,
      dateModified,
      breadcrumb: { "@id": `${postUrl}#breadcrumb` },
      inLanguage: "en-AU",
      potentialAction: { "@type": "ReadAction", target: [postUrl] },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: speakable,
      },
    },
  ];

  if (imageUrl && article.image) {
    graph.push({
      "@type": "ImageObject",
      "@id": `${postUrl}#primaryimage`,
      url: imageUrl,
      contentUrl: imageUrl,
      width: article.image.width,
      height: article.image.height,
      caption:
        article.image.caption ??
        article.alternativeHeadline ??
        article.title,
    });
  }

  graph.push(
    blogPostingNode(
      article,
      postUrl,
      authorId,
      imageUrl,
      datePublished,
      dateModified,
    ),
  );
  appendComparisonNodes(graph, article, postUrl);

  return { "@context": "https://schema.org", "@graph": graph };
}
