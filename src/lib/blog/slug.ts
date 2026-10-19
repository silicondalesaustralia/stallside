import { prisma } from "@/lib/prisma";
import { isCodeArticleSlug } from "@/lib/farms-stand-news";

export function slugifyBlogTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  if (isCodeArticleSlug(slug)) return true;
  const existing = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true },
  });
  return Boolean(existing && existing.id !== exceptId);
}

/** First free slug: base, base-2, base-3… */
export async function uniqueBlogSlug(raw: string, exceptId?: string): Promise<string> {
  const base = slugifyBlogTitle(raw) || "post";
  if (!(await slugTaken(base, exceptId))) return base;
  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base}-${n}`;
    if (!(await slugTaken(candidate, exceptId))) return candidate;
  }
  throw new Error(`Could not find a free slug for "${base}"`);
}
