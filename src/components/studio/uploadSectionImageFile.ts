import { uploadSectionImage } from "@/app/dashboard/(gated)/website/media/actions";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

/** Resizes and uploads one image for a section; resolves to its URL or throws a seller-readable error. */
export async function uploadSectionImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image. Use a JPG, PNG or WebP.");
  const prepared = await prepareImageFile(file, LOGO_IMAGE_MAX_BYTES);
  const formData = new FormData();
  formData.set("image", prepared);
  const result = await uploadSectionImage(formData);
  if (!result.ok) throw new Error(result.error);
  return result.url;
}
