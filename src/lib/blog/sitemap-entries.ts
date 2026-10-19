import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/legal";
import { getAllArticles, newsArticlePath } from "@/lib/farms-stand-news";
import { getActiveAuthors } from "./authors";
import { getAllGuides } from "./guides";
import { authorPath } from "./paths";

/** News, guides (one entry per canonical URL) and author profiles. */
export async function blogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const posts = [...(await getAllArticles()), ...(await getAllGuides())];
  const seen = new Set<string>();
  for (const article of posts) {
    const path = article.canonicalPath ?? newsArticlePath(article.slug);
    if (seen.has(path)) continue;
    seen.add(path);
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }
  for (const author of await getActiveAuthors()) {
    entries.push({
      url: `${SITE_URL}${authorPath(author.slug)}`,
      lastModified: author.updatedAt,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }
  return entries;
}
