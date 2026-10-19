const PLATFORMS: Array<[RegExp, string]> = [
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)(x|twitter)\.com$/, "X"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)facebook\.com$/, "Facebook"],
  [/(^|\.)youtube\.com$/, "YouTube"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)threads\.(net|com)$/, "Threads"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)bsky\.app$/, "Bluesky"],
];

/** Human label for a profile URL ("LinkedIn", "X", or the bare hostname). */
export function socialPlatformLabel(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
  return PLATFORMS.find(([pattern]) => pattern.test(host))?.[1] ?? host;
}
