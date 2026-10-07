import { uploadProductImage } from "@/lib/product-image-upload";
import { PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

/** Copy a Square CDN image into Vendl blob storage. Returns null when it can't. */
export async function copySquareImage(input: {
  url: string;
  standId: string;
  productId: string;
}): Promise<string | null> {
  try {
    const res = await fetch(input.url);
    if (!res.ok) {
      console.error("Square image fetch failed", res.status, input.url);
      return null;
    }
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > PRODUCT_IMAGE_MAX_BYTES) return null;
    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const file = new File([bytes], `square.${ext}`, { type: type || "image/jpeg" });
    return await uploadProductImage(input.standId, input.productId, file);
  } catch (error) {
    console.error("Square image copy failed", error);
    return null;
  }
}
