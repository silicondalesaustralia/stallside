import sharp from "sharp";
import { PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

const MAX_EDGE = 1600;
const QUALITIES = [85, 75, 65, 55, 45] as const;

/**
 * Phone photos arrive full size; this does on the server what the web form does in the browser:
 * upright, at most 1600px on the long edge, JPEG under the product image limit.
 */
export async function shrinkPhoto(file: File): Promise<File> {
  const input = Buffer.from(await file.arrayBuffer());
  const base = sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });

  for (const quality of QUALITIES) {
    const output = await base.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (output.byteLength <= PRODUCT_IMAGE_MAX_BYTES) {
      const name = (file.name.replace(/\.[^.]+$/, "") || "photo") + ".jpg";
      return new File([new Uint8Array(output)], name, { type: "image/jpeg" });
    }
  }
  throw new Error("That photo is too detailed to upload. Try another one.");
}
