import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

export type ProductStatusAction = "hide" | "show" | "archive" | "restore";
type Result = { ok: true } | { error: string };

const MAX_PRICE_CENTS = 100_000_000;

function findForUpdate(ownerId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: { id: true, slug: true, standId: true, isArchived: true, stand: { select: { slug: true } } },
  });
}

type UpdatedProduct = NonNullable<Awaited<ReturnType<typeof findForUpdate>>>;

/** Dashboard + shop pages that show this product. */
export function revalidateProductPaths(opts: { standId: string; standSlug: string; productId: string; slug: string }) {
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${opts.productId}`);
  revalidatePath(`/dashboard/businesses/${opts.standId}`);
  revalidatePath(`/s/${opts.standSlug}`);
  revalidateTag(standCatalogTag(opts.standSlug), "max");
  revalidatePath(`/s/${opts.standSlug}/${opts.slug}`);
}

function revalidate(product: UpdatedProduct) {
  revalidateProductPaths({
    standId: product.standId,
    standSlug: product.stand.slug,
    productId: product.id,
    slug: product.slug,
  });
}

const STATUS_DATA = {
  hide: { isHidden: true },
  show: { isHidden: false },
  archive: { isArchived: true, isActive: false, isHidden: false },
  restore: { isArchived: false, isActive: true, isHidden: false },
} as const satisfies Record<ProductStatusAction, object>;

/** Hide/show in the shop, move to drafts, or publish again. */
export async function setOwnerProductStatus(
  ownerId: string,
  productId: string,
  action: ProductStatusAction,
): Promise<Result> {
  const product = await findForUpdate(ownerId, productId);
  if (!product) return { error: "Product not found." };
  if (product.isArchived && (action === "hide" || action === "show")) {
    return { error: "Restore the product before changing catalog visibility." };
  }
  await prisma.product.update({ where: { id: product.id }, data: STATUS_DATA[action] });
  revalidate(product);
  return { ok: true };
}

/** Price and optional "Was" price (must be higher than the price; display only). */
export async function updateOwnerProductPrice(
  ownerId: string,
  productId: string,
  input: { priceCents: number; compareAtPriceCents: number | null },
): Promise<Result> {
  const { priceCents, compareAtPriceCents } = input;
  if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > MAX_PRICE_CENTS) {
    return { error: "Invalid price." };
  }
  if (compareAtPriceCents != null && compareAtPriceCents <= priceCents) {
    return { error: "The 'Was' price must be higher than the price, or left blank." };
  }
  const product = await findForUpdate(ownerId, productId);
  if (!product) return { error: "Product not found." };
  await prisma.product.update({ where: { id: product.id }, data: { priceCents, compareAtPriceCents } });
  revalidate(product);
  return { ok: true };
}
