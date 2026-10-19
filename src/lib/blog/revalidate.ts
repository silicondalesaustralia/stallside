import { revalidatePath } from "next/cache";
import type { BlogSection } from "@/generated/prisma/client";
import { blogPostPath, blogSectionIndexPath } from "./paths";

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
  revalidatePath("/sitemap.xml");
}
