import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isReservedSiteSlug } from "@/lib/storefront/site-slugs";
import { siteSlugOwnersFromConfig } from "@/lib/storefront/resolve-site-slug";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

export type OrderActionResult = { ok: true } | { error: string };

/** Slugs of the site's custom pages and blog categories, which share `/{slug}` with categories. */
async function pageAndTopicSlugs(ownerId: string): Promise<string[]> {
  const storefront = await prisma.storefront.findFirst({ where: { ownerId }, select: { draftConfig: true } });
  if (!storefront) return [];
  const owners = await siteSlugOwnersFromConfig(ownerId, storefront.draftConfig);
  return owners.filter((o) => o.kind !== "category").map((o) => o.slug);
}

/** Whether `slug` is the one generated from `title` (`{title}` or `{title}-N`), not one the owner chose. */
export function isAutoCategorySlug(slug: string, title: string): boolean {
  const root = slugify(title) || "category";
  return slug === root || new RegExp(`^${root}-\\d+$`).test(slug);
}

/** A category slug no other category, custom page or blog category on the site uses. */
export async function uniqueCategorySlug(
  ownerId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "category";
  const [taken, siteSlugs] = await Promise.all([
    prisma.category.findMany({
      where: {
        ownerId,
        slug: { startsWith: root },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { slug: true },
    }),
    pageAndTopicSlugs(ownerId),
  ]);
  const used = new Set([...taken.map((c) => c.slug), ...siteSlugs]);
  if (!used.has(root) && !isReservedSiteSlug(root)) return root;
  for (let i = 2; i < 1000; i += 1) {
    if (!used.has(`${root}-${i}`)) return `${root}-${i}`;
  }
  throw new Error("Could not allocate category slug");
}

/** Refresh dashboard + every public stand page for this owner. */
export async function revalidateOwnerStores(ownerId: string) {
  const stands = await prisma.stand.findMany({
    where: { ownerId },
    select: { slug: true },
  });
  for (const stand of stands) {
    revalidateTag(standCatalogTag(stand.slug), "max");
    revalidatePath(`/s/${stand.slug}`, "layout");
  }
  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/dashboard/products", "layout");
}

/** Validate an ordered id list sent from SortableOrderList. */
export function validOrderedIds(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length > 2000) return null;
  const ids = raw.filter((v): v is string => typeof v === "string" && v.length > 0);
  return ids.length === raw.length && new Set(ids).size === ids.length ? ids : null;
}
