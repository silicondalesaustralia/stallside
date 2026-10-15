/**
 * The page open in the editor, in a browser: the live page once the site is published,
 * otherwise its draft preview. `viewPreviewUrl` is the draft view (`…/shop/{slug}/…?draft=1`).
 */
export function editorPageUrl({
  isPublished,
  liveUrl,
  viewPreviewUrl,
}: {
  isPublished: boolean;
  liveUrl?: string;
  viewPreviewUrl: string;
}): string {
  if (!isPublished || !liveUrl) return viewPreviewUrl;
  let pathname: string;
  try {
    pathname = new URL(viewPreviewUrl, "http://local").pathname;
  } catch {
    return liveUrl;
  }
  const rest = pathname.replace(/^\/shop\/[^/]+/, "");
  const sitePath = rest === "/studio-preview" ? "" : rest.replace(/\/$/, "");
  return `${liveUrl.replace(/\/$/, "")}${sitePath}`;
}
