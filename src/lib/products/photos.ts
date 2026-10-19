import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/product-image-upload";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { PRODUCT_PHOTOS_MAX, isPhotoReorder, productImageList, splitProductPhotos } from "@/lib/product-images";
import { parseImageAlts, withImageAlt } from "@/lib/product-image-alts";

export type PhotoResult = { ok: true } | { error: string };

async function ownedProduct(productId: string, ownerId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: {
      id: true,
      slug: true,
      standId: true,
      imageUrl: true,
      galleryImageUrls: true,
      imageAlts: true,
      stand: { select: { slug: true } },
    },
  });
}

type OwnedProduct = NonNullable<Awaited<ReturnType<typeof ownedProduct>>>;

function photosOf(product: OwnedProduct): string[] {
  return productImageList(product.imageUrl, product.galleryImageUrls);
}

function revalidateProduct(product: OwnedProduct) {
  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
  revalidateTag(standCatalogTag(product.stand.slug), "max");
}

async function savePhotos(product: OwnedProduct, photos: string[]): Promise<PhotoResult> {
  await prisma.product.update({ where: { id: product.id }, data: splitProductPhotos(photos) });
  revalidateProduct(product);
  return { ok: true };
}

/** Uploads one photo and adds it after the others; the first photo a product gets becomes its main photo. */
export async function addOwnerProductPhoto(ownerId: string, productId: string, file: File): Promise<PhotoResult> {
  const product = await ownedProduct(productId, ownerId);
  if (!product) return { error: "Product not found." };
  const photos = photosOf(product);
  if (photos.length >= PRODUCT_PHOTOS_MAX) return { error: `You can add up to ${PRODUCT_PHOTOS_MAX} photos.` };
  if (file.size === 0) return { error: "Choose a photo first." };
  const url = await uploadProductImage(product.standId, product.id, file);
  return savePhotos(product, [...photos, url]);
}

/** Removes a photo; removing the main photo makes the next one the main photo. */
export async function removeOwnerProductPhoto(ownerId: string, productId: string, url: string): Promise<PhotoResult> {
  const product = await ownedProduct(productId, ownerId);
  if (!product) return { error: "Product not found." };
  return savePhotos(product, photosOf(product).filter((u) => u !== url));
}

/** Saves a new photo order; the first photo becomes the main photo. */
export async function reorderOwnerProductPhotos(ownerId: string, productId: string, order: string[]): Promise<PhotoResult> {
  const product = await ownedProduct(productId, ownerId);
  if (!product) return { error: "Product not found." };
  if (!isPhotoReorder(photosOf(product), order)) {
    return { error: "Photos changed somewhere else. Refresh and try again." };
  }
  return savePhotos(product, order);
}

/** Saves one photo's alt text (what screen readers and search engines read); blank clears it. */
export async function saveOwnerProductPhotoAlt(
  ownerId: string,
  productId: string,
  url: string,
  alt: string,
): Promise<PhotoResult> {
  const product = await ownedProduct(productId, ownerId);
  if (!product) return { error: "Product not found." };
  const photos = photosOf(product);
  if (!photos.includes(url)) return { error: "That photo was removed. Refresh and try again." };
  const imageAlts = withImageAlt(parseImageAlts(product.imageAlts), photos, url, alt);
  await prisma.product.update({ where: { id: product.id }, data: { imageAlts } });
  revalidateProduct(product);
  return { ok: true };
}
