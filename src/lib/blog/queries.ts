import type { BlogSection } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { NewsArticle } from "@/lib/farms-stand-news/types";
import { blogPostToNewsArticle } from "./to-news-article";

function liveWhere(now: Date) {
  return { status: "PUBLISHED" as const, publishedAt: { lte: now } };
}

/** Live posts whose canonical section, or cross-listing, is this section. */
export async function getLiveBlogArticles(section: BlogSection): Promise<NewsArticle[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        ...liveWhere(new Date()),
        OR: [{ section }, { alsoListedIn: section }],
      },
      include: { author: true },
      orderBy: { publishedAt: "desc" },
    });
    return posts.map(blogPostToNewsArticle);
  } catch (error) {
    console.error(`[blog] failed to load ${section} posts`, error);
    return [];
  }
}

/** Live post by slug, only if its canonical section matches. */
export async function getLiveBlogArticle(
  section: BlogSection,
  slug: string,
): Promise<NewsArticle | undefined> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { ...liveWhere(new Date()), slug, section },
      include: { author: true },
    });
    return post ? blogPostToNewsArticle(post) : undefined;
  } catch (error) {
    console.error(`[blog] failed to load post ${slug}`, error);
    return undefined;
  }
}

/** Canonical section of a live post (for redirecting the wrong section's URL). */
export async function findLiveBlogSection(slug: string): Promise<BlogSection | null> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { ...liveWhere(new Date()), slug },
      select: { section: true },
    });
    return post?.section ?? null;
  } catch (error) {
    console.error(`[blog] failed to look up section for ${slug}`, error);
    return null;
  }
}

export async function getLiveBlogArticlesByAuthor(authorId: string): Promise<NewsArticle[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { ...liveWhere(new Date()), authorId },
      include: { author: true },
      orderBy: { publishedAt: "desc" },
    });
    return posts.map(blogPostToNewsArticle);
  } catch (error) {
    console.error(`[blog] failed to load posts for author ${authorId}`, error);
    return [];
  }
}

export async function getLiveBlogSlugs(section: BlogSection): Promise<string[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { ...liveWhere(new Date()), section },
      select: { slug: true },
    });
    return posts.map((p) => p.slug);
  } catch (error) {
    console.error(`[blog] failed to load ${section} slugs`, error);
    return [];
  }
}
