import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncManualStockToSquare } from "@/lib/square/sync-stock";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { notifyLowStockForProducts } from "@/lib/notify";

/** Revalidates production + catalogue pages and pushes product stock to Square after a batch change. */
export async function afterProductionChange(ownerId: string, productId: string | null) {
  revalidatePath("/dashboard/production", "layout");
  if (!productId) return;
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/products/${productId}`);
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { standId: true, stockQuantity: true, lowStockThreshold: true, stand: { select: { slug: true } } },
    });
    if (!product) return;
    revalidateTag(standCatalogTag(product.stand.slug), "max");
    await syncManualStockToSquare(ownerId, [productId]);
    if (product.stockQuantity <= product.lowStockThreshold) {
      await notifyLowStockForProducts([productId], ownerId, product.standId);
    }
  } catch (error) {
    console.error("Post-production stock sync failed", error);
  }
}
