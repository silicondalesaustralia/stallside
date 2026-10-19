import type { BlogSection } from "@/generated/prisma/client";

export function guidesIndexPath() {
  return "/guides";
}

export function guidePath(slug: string) {
  return `/guides/${slug}`;
}

/** Canonical public path: one URL per post, even when cross-listed. */
export function blogPostPath(section: BlogSection, slug: string) {
  return section === "GUIDE" ? guidePath(slug) : `/farms-stand-news/${slug}`;
}

export function blogSectionLabel(section: BlogSection) {
  return section === "GUIDE" ? "Guides" : "Farm Stand News";
}

export function blogSectionIndexPath(section: BlogSection) {
  return section === "GUIDE" ? guidesIndexPath() : "/farms-stand-news";
}

export function adminBlogPath(tab?: string) {
  return tab ? `/admin/blog?tab=${tab}` : "/admin/blog";
}

export function adminBlogPostPath(id: string) {
  return `/admin/blog/${id}`;
}

export function adminBlogRevisionPath(id: string) {
  return `/admin/blog/revisions/${id}`;
}
