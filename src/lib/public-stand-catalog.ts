import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  businessPageProductWhere,
  productLiveWhere,
} from "@/lib/product-visibility";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

export { standCatalogTag } from "@/lib/stand-catalog-tag";

const productInclude = {
  optionGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: { choices: { orderBy: { sortOrder: "asc" as const } } },
  },
};

const ownerInclude = {
  owner: { include: { user: { select: { email: true, role: true } } } },
} as const;

function reviveDates<T extends { products: Array<Record<string, unknown>> }>(
  stand: T,
): T {
  for (const product of stand.products) {
    for (const key of ["orderByAt", "collectionAt", "createdAt", "updatedAt"] as const) {
      const value = product[key];
      if (typeof value === "string") {
        product[key] = new Date(value);
      }
    }
  }
  return stand;
}

async function fetchStandWithProducts(
  slug: string,
  mode: "catalog" | "cart",
) {
  return prisma.stand.findUnique({
    where: { slug },
    include: {
      products: {
        where: mode === "catalog" ? businessPageProductWhere : productLiveWhere,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: productInclude,
      },
      ...ownerInclude,
    },
  });
}

/** Cached public stand + products for catalog or cart (30s). */
export function loadPublicStandCatalog(
  slug: string,
  mode: "catalog" | "cart" = "catalog",
) {
  const cached = unstable_cache(
    async () => fetchStandWithProducts(slug, mode),
    ["public-stand", slug, mode],
    { revalidate: 30, tags: [standCatalogTag(slug)] },
  );
  return cached().then((stand) => (stand ? reviveDates(stand) : null));
}

/** Tiny cached row for generateMetadata. */
export function loadPublicStandMeta(slug: string) {
  return unstable_cache(
    async () =>
      prisma.stand.findUnique({
        where: { slug },
        select: {
          name: true,
          slug: true,
          locationLabel: true,
          logoUrl: true,
          isActive: true,
        },
      }),
    ["public-stand-meta", slug],
    { revalidate: 60, tags: [standCatalogTag(slug)] },
  )();
}
