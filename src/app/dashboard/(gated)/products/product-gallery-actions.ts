"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/product-image-upload";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { PRODUCT_GALLERY_MAX, moveGalleryImage } from "@/lib/product-images";

type GalleryResult = { ok: true } | { ok: false; error: string };

async function ownedProduct(productId: string, ownerId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: { id: true, slug: true, standId: true, galleryImageUrls: true, stand: { select: { slug: true } } },
  });
}

async function saveGallery(
  product: NonNullable<Awaited<ReturnType<typeof ownedProduct>>>,
  galleryImageUrls: string[],
): Promise<GalleryResult> {
  await prisma.product.update({ where: { id: product.id }, data: { galleryImageUrls } });
  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
  revalidateTag(standCatalogTag(product.stand.slug), "max");
  return { ok: true };
}

/** Uploads one extra photo and adds it to the end of the product's photos. */
export async function addProductGalleryImage(productId: string, formData: FormData): Promise<GalleryResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const product = await ownedProduct(productId, owner.id);
    if (!product) return { ok: false, error: "Product not found." };
    if (product.galleryImageUrls.length >= PRODUCT_GALLERY_MAX) {
      return { ok: false, error: `You can add up to ${PRODUCT_GALLERY_MAX} extra photos.` };
    }
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
    const url = await uploadProductImage(product.standId, product.id, file);
    return await saveGallery(product, [...product.galleryImageUrls, url]);
  } catch (err) {
    console.error("[product gallery add]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't upload that photo." };
  }
}

export async function removeProductGalleryImage(productId: string, url: string): Promise<GalleryResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const product = await ownedProduct(productId, owner.id);
    if (!product) return { ok: false, error: "Product not found." };
    return await saveGallery(product, product.galleryImageUrls.filter((u) => u !== url));
  } catch (err) {
    console.error("[product gallery remove]", err);
    return { ok: false, error: "Couldn't remove that photo. Try again." };
  }
}

export async function moveProductGalleryImage(productId: string, url: string, direction: -1 | 1): Promise<GalleryResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const product = await ownedProduct(productId, owner.id);
    if (!product) return { ok: false, error: "Product not found." };
    return await saveGallery(product, moveGalleryImage(product.galleryImageUrls, url, direction === -1 ? -1 : 1));
  } catch (err) {
    console.error("[product gallery move]", err);
    return { ok: false, error: "Couldn't move that photo. Try again." };
  }
}
