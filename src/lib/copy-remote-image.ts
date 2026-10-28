import { uploadProductImage } from "@/lib/product-image-upload";
import { PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

/** Copy a public image URL into Vendl blob storage. Returns null when it can't. */
export async function copyRemoteImage(input: {
  url: string;
  standId: string;
  productId: string;
  label: string;
}): Promise<string | null> {
  if (!/^https:\/\//i.test(input.url)) return null;
  try {
    const res = await fetch(input.url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.error(`${input.label} image fetch failed`, res.status, input.url);
      return null;
    }
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (type && !type.startsWith("image/")) return null;
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > PRODUCT_IMAGE_MAX_BYTES) return null;
    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const file = new File([bytes], `${input.label.toLowerCase()}.${ext}`, {
      type: type || "image/jpeg",
    });
    return await uploadProductImage(input.standId, input.productId, file);
  } catch (error) {
    console.error(`${input.label} image copy failed`, error);
    return null;
  }
}
