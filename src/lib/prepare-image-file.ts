const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_EDGE = 1600;
const QUALITIES = [0.85, 0.75, 0.65, 0.55, 0.45] as const;

function mbLabel(maxBytes: number): string {
  const mb = maxBytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

function needsTranscode(type: string, size: number, maxBytes: number): boolean {
  if (size <= 0 || size > maxBytes) return true;
  return !ALLOWED.has(type);
}

/** Shrink / convert camera photos so they fit upload limits (canvas JPEG). */
export async function prepareImageFile(
  file: File,
  maxBytes: number,
): Promise<File> {
  const type = file.type || "application/octet-stream";
  if (!needsTranscode(type, file.size, maxBytes)) {
    return file;
  }
  if (
    type !== "application/octet-stream" &&
    !type.startsWith("image/") &&
    !ALLOWED.has(type)
  ) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Could not read that image. On iPhone, choose “Most Compatible” or export as JPEG.",
    );
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not process image.");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    for (const quality of QUALITIES) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
      if (!blob || blob.size > maxBytes) continue;
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    }
    throw new Error(
      `Image must be under ${mbLabel(maxBytes)}. Try a smaller photo.`,
    );
  } finally {
    bitmap.close();
  }
}
