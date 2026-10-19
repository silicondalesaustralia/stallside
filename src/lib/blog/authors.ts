import type { BlogAuthor } from "@/generated/prisma/client";
import { SITE_URL } from "@/lib/legal";
import { NEWS_SOCIAL_SAME_AS } from "@/lib/farms-stand-news/schema-base";
import type { NewsAuthor } from "@/lib/farms-stand-news/types";
import { prisma } from "@/lib/prisma";
import { authorPath } from "./paths";

/** Publisher fallback for posts with no named author. */
export const ORGANIZATION_AUTHOR: NewsAuthor = {
  slug: "vendl",
  kind: "organization",
  name: "Vendl",
  bio: "Guides, news and comparisons for farm stands, home producers and small online sellers.",
  jobTitle: "Editorial",
  url: `${SITE_URL}/about`,
  sameAs: [...NEWS_SOCIAL_SAME_AS],
};

export type PublicBlogAuthor = Pick<
  BlogAuthor,
  "slug" | "name" | "jobTitle" | "shortBio" | "avatarUrl" | "expertise" | "sameAs" | "active"
>;

/** Inactive authors have no public profile, so their posts fall back to the publisher. */
export function blogAuthorToNewsAuthor(author: PublicBlogAuthor | null): NewsAuthor {
  if (!author?.active) return ORGANIZATION_AUTHOR;
  return {
    slug: author.slug,
    kind: "person",
    name: author.name,
    bio: author.shortBio,
    jobTitle: author.jobTitle,
    profilePath: authorPath(author.slug),
    imageUrl: author.avatarUrl ?? undefined,
    knowsAbout: author.expertise,
    sameAs: author.sameAs,
  };
}

/** Author credited on new drafts (agent and manual); null when none is set. */
export async function defaultBlogAuthorId(): Promise<string | null> {
  const author = await prisma.blogAuthor.findFirst({
    where: { isDefault: true, active: true },
    select: { id: true },
  });
  return author?.id ?? null;
}

export async function getActiveAuthor(slug: string) {
  try {
    return await prisma.blogAuthor.findFirst({ where: { slug, active: true } });
  } catch (error) {
    console.error(`[blog] failed to load author ${slug}`, error);
    return null;
  }
}

export async function getActiveAuthors() {
  try {
    return await prisma.blogAuthor.findMany({
      where: { active: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("[blog] failed to load authors", error);
    return [];
  }
}
