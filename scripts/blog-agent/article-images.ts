import type { AgentArticle } from "./article-schema";
import type { PlacedImage } from "./figures";
import { tryCreatePostImage, uniqueFilenames } from "./images";

/** Blob folder for a post's images: the existing slug for updates, else the new slug or title. */
export function folderFor(article: AgentArticle, targetSlug: string | null): string {
  const raw = targetSlug ?? article.slug ?? article.title;
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "post";
}

export async function inlineImages(article: AgentArticle, folder: string, limit: number): Promise<PlacedImage[]> {
  const briefs = uniqueFilenames(article.images.inline.slice(0, limit));
  const results = await Promise.all(
    briefs.map(async (brief): Promise<PlacedImage | null> => {
      const uploaded = await tryCreatePostImage({ folder, filename: brief.filename, prompt: brief.prompt, shape: "landscape", kind: "inline" });
      return uploaded ? { ...uploaded, alt: brief.alt, caption: brief.caption, afterHeading: brief.afterHeading } : null;
    }),
  );
  return results.filter((image): image is PlacedImage => image !== null);
}
