import { prisma } from "@/lib/prisma";
import { addOwnerProductPhotoFromUrl } from "@/lib/products/photos";
import { matchProductForFileName } from "./match";

type AssignOk = { ok: true; productId: string; productName: string };
type AssignErr = { ok: false; error: string };

/** Links one library asset URL onto a product as a photo. */
export async function assignLibraryAssetToProduct(
  ownerId: string,
  assetId: string,
  productId: string,
): Promise<AssignOk | AssignErr> {
  const asset = await prisma.mediaLibraryAsset.findFirst({
    where: { id: assetId, ownerId },
    select: { id: true, url: true },
  });
  if (!asset) return { ok: false, error: "Photo not found in your library." };

  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: { id: true, name: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  const result = await addOwnerProductPhotoFromUrl(ownerId, product.id, asset.url);
  if ("error" in result) return { ok: false, error: result.error };
  return { ok: true, productId: product.id, productName: product.name };
}

/** Assigns each library photo to a product whose slug, SKU or name matches the filename. */
export async function matchLibraryAssetsToProducts(ownerId: string): Promise<{
  matched: number;
  skipped: number;
  errors: string[];
}> {
  const [assets, products] = await Promise.all([
    prisma.mediaLibraryAsset.findMany({
      where: { ownerId },
      select: { id: true, url: true, fileName: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.product.findMany({
      where: { ownerId, isArchived: false },
      select: { id: true, name: true, slug: true, sku: true },
      take: 2000,
    }),
  ]);

  let matched = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const asset of assets) {
    const product = matchProductForFileName(asset.fileName, products);
    if (!product) {
      skipped += 1;
      continue;
    }
    const result = await addOwnerProductPhotoFromUrl(ownerId, product.id, asset.url);
    if ("error" in result) {
      if (result.error.includes("already on this product") || result.error.includes("up to")) {
        skipped += 1;
      } else {
        errors.push(`${asset.fileName}: ${result.error}`);
      }
      continue;
    }
    matched += 1;
  }

  return { matched, skipped, errors };
}
