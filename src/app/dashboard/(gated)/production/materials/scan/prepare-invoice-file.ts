const MAX_EDGE = 2200;
const MAX_BYTES = 5 * 1024 * 1024;

/** PDFs pass through; photos are shrunk to a readable JPEG so uploads stay small (also converts HEIC where the browser can decode it). */
export async function prepareInvoiceFile(file: File): Promise<File> {
  if (file.type === "application/pdf") {
    if (file.size > MAX_BYTES) throw new Error("That PDF is over 5 MB.");
    return file;
  }
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error("Use a photo or a PDF.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This browser can't open that photo format. Try a JPEG or a screenshot.");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process that photo.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("Couldn't process that photo.");
  if (blob.size > MAX_BYTES) throw new Error("That photo is too large even after shrinking.");
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
