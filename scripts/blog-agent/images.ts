import { appPost } from "./api";
import { generateImage, type ImageShape } from "./openai";

/** Appended to every prompt: consistent editorial look plus the playbook's hard limits. */
const STYLE_RULES =
  "Style: realistic editorial photograph, natural daylight, warm and honest, shallow depth of field, " +
  "uncluttered composition suitable for a blog header. Strictly no text, letters, numbers, signage wording, " +
  "logos, brand names, watermarks, phone or app screens, and no recognisable real people or real locations.";

export type UploadedImage = { url: string; width: number; height: number };

/** Generate one image and store it at blog/{folder}/{filename}.webp via the app. */
export async function createPostImage(opts: {
  folder: string;
  filename: string;
  prompt: string;
  shape: ImageShape;
  kind: "hero" | "inline";
}): Promise<UploadedImage> {
  const image = await generateImage(`${opts.prompt.trim()}\n\n${STYLE_RULES}`, opts.shape, opts.kind);
  return appPost<UploadedImage>("/images", {
    folder: opts.folder,
    filename: opts.filename,
    contentType: "image/webp",
    base64: image.base64,
    width: image.width,
    height: image.height,
  });
}

/** Image failures shouldn't sink a finished article; log and continue without that image. */
export async function tryCreatePostImage(opts: Parameters<typeof createPostImage>[0]): Promise<UploadedImage | null> {
  try {
    return await createPostImage(opts);
  } catch (error) {
    console.error(`Image "${opts.filename}" failed`, error);
    return null;
  }
}

export function uniqueFilenames<T extends { filename: string }>(briefs: T[]): T[] {
  const seen = new Set<string>();
  return briefs.map((brief) => {
    let name = brief.filename.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
    for (let n = 2; seen.has(name); n += 1) name = `${name.replace(/-\d+$/, "")}-${n}`;
    seen.add(name);
    return { ...brief, filename: name };
  });
}
