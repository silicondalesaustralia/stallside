"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/product-image-upload";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { PRODUCT_PHOTOS_MAX, isPhotoReorder, productImageList, splitProductPhotos } from "@/lib/product-images";

type PhotoResult = { ok: true } | { ok: false; error: string };

async function ownedProduct(productId: string, ownerId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: {
      id: true,
      slug: true,
      standId: true,
      imageUrl: true,
      galleryImageUrls: true,
      stand: { select: { slug: true } },
    },
  });
}

type OwnedProduct = NonNullable<Awaited<ReturnType<typeof ownedProduct>>>;

function photosOf(product: OwnedProduct): string[] {
  return productImageList(product.imageUrl, product.galleryImageUrls);
}

async function savePhotos(product: OwnedProduct, photos: string[]): Promise<PhotoResult> {
  await prisma.product.update({ where: { id: product.id }, data: splitProductPhotos(photos) });
  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
  revalidateTag(standCatalogTag(product.stand.slug), "max");
  return { ok: true };
}

/** Uploads one photo and adds it after the others; the first photo a product gets becomes its main photo. */
export async function addProductPhoto(productId: string, formData: FormData): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const product = await ownedProduct(productId, owner.id);
    if (!product) return { ok: false, error: "Product not found." };
    const photos = photosOf(product);
    if (photos.length >= PRODUCT_PHOTOS_MAX) {
      return { ok: false, error: `You can add up to ${PRODUCT_PHOTOS_MAX} photos.` };
    }
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
    const url = await uploadProductImage(product.standId, product.id, file);
    return await savePhotos(product, [...photos, url]);
  } catch (err) {
    console.error("[product photo add]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't upload that photo." };
  }
}

/** Removes a photo; removing the main photo makes the next one the main photo. */
export async function removeProductPhoto(productId: string, url: string): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const product = await ownedProduct(productId, owner.id);
    if (!product) return { ok: false, error: "Product not found." };
    return await savePhotos(product, photosOf(product).filter((u) => u !== url));
  } catch (err) {
    console.error("[product photo remove]", err);
    return { ok: false, error: "Couldn't remove that photo. Try again." };
  }
}

/** Saves a new photo order; the first photo becomes the main photo. */
export async function reorderProductPhotos(productId: string, order: string[]): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const product = await ownedProduct(productId, owner.id);
    if (!product) return { ok: false, error: "Product not found." };
    if (!isPhotoReorder(photosOf(product), order)) {
      return { ok: false, error: "Photos changed in another tab. Refresh and try again." };
    }
    return await savePhotos(product, order);
  } catch (err) {
    console.error("[product photo reorder]", err);
    return { ok: false, error: "Couldn't reorder photos. Try again." };
  }
}
