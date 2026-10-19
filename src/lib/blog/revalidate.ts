import { revalidatePath } from "next/cache";
import type { BlogSection } from "@/generated/prisma/client";
import { authorPath, authorsIndexPath, blogPostPath, blogSectionIndexPath } from "./paths";

/** Refresh every public page a post can appear on. */
export function revalidateBlogPost(
  section: BlogSection,
  slug: string,
  alsoListedIn?: BlogSection | null,
) {
  revalidatePath(blogPostPath(section, slug));
  revalidatePath(blogSectionIndexPath(section));
  if (alsoListedIn && alsoListedIn !== section) {
    revalidatePath(blogSectionIndexPath(alsoListedIn));
  }
  revalidatePath("/authors/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

/** Author details appear on their profile and in the byline/schema of every post. */
export function revalidateBlogAuthor(...slugs: string[]) {
  for (const slug of new Set(slugs)) revalidatePath(authorPath(slug));
  revalidatePath(authorsIndexPath());
  revalidatePath("/guides/[slug]", "page");
  revalidatePath("/farms-stand-news/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
