/** Turn a YouTube/Vimeo watch URL into an embeddable src, or null. */
export function toEmbedUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl) return null;
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v") || url.pathname.split("/embed/")[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") {
      return videoUrl;
    }
  } catch {
    return null;
  }
  return null;
}
