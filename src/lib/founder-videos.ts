import { toEmbedUrl } from "@/lib/knowledge-base/embed";

/**
 * Founder videos for the dashboard. While `src` is null the section shows a
 * "coming soon" placeholder and loads no media. To go live: upload the files
 * (e.g. to /public/videos), then set src (MP4), poster (image) and captions (WebVTT),
 * or set youtubeUrl (takes precedence over src).
 */
export type FounderVideo = {
  title: string;
  youtubeUrl: string | null;
  src: string | null;
  poster: string | null;
  captions: string | null;
  durationLabel: string;
  placeholderMessage: string;
};

/** Privacy-enhanced YouTube embed src (always has a query string), or null. */
export function founderVideoEmbedSrc(video: FounderVideo): string | null {
  const embed = toEmbedUrl(video.youtubeUrl);
  if (!embed?.startsWith("https://www.youtube.com/embed/")) return null;
  return `${embed.replace("www.youtube.com", "www.youtube-nocookie.com")}?rel=0`;
}

export const WELCOME_VIDEO: FounderVideo = {
  title: "Welcome to Vendl",
  youtubeUrl: "https://youtu.be/eALrh_gOmRM",
  src: null,
  poster: null,
  captions: null,
  durationLabel: "About 1 minute",
  placeholderMessage: "A personal welcome video is coming soon.",
};

export const PRO_VIDEO: FounderVideo = {
  title: "Why We Built Vendl Pro",
  youtubeUrl: null,
  src: null,
  poster: null,
  captions: null,
  durationLabel: "About 1 minute",
  placeholderMessage: "A short introduction to Pro is coming soon.",
};
