import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

export const FAVICON_ACCEPT = ".png,.ico,.webp,image/png,image/x-icon,image/vnd.microsoft.icon,image/webp";
export const FAVICON_MIN_PX = 48;
export const FAVICON_BEST_PX = 512;
export const FAVICON_MAX_KB = Math.floor(LOGO_IMAGE_MAX_BYTES / 1024);

const RASTER = new Set(["image/png", "image/webp"]);

function isIco(file: File) {
  return file.type.includes("icon") || file.name.toLowerCase().endsWith(".ico");
}

/** A reason the file can't be a favicon, or null when it's fine. ICO files skip the size check. */
export async function faviconFileProblem(file: File): Promise<string | null> {
  if (!RASTER.has(file.type) && !isIco(file)) return "Use a PNG, ICO or WebP file.";
  if (file.size > LOGO_IMAGE_MAX_BYTES) return `That file is over ${FAVICON_MAX_KB} KB. Save a smaller PNG.`;
  if (isIco(file)) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    if (width !== height) return `It needs to be square. This one is ${width} × ${height} px.`;
    if (width < FAVICON_MIN_PX) return `It's only ${width} × ${height} px. Use at least ${FAVICON_MIN_PX} × ${FAVICON_MIN_PX} px.`;
    return null;
  } catch (err) {
    console.error("[favicon check]", err);
    return "We couldn't read that image. Try exporting it again as PNG.";
  }
}
