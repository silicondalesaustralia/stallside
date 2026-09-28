import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

export type OrderActionResult = { ok: true } | { error: string };

export async function uniqueCategorySlug(
  ownerId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "category";
  const taken = await prisma.category.findMany({
    where: {
      ownerId,
      slug: { startsWith: root },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { slug: true },
  });
  const used = new Set(taken.map((c) => c.slug));
  if (!used.has(root)) return root;
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
