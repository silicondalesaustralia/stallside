/**
 * Founder videos for the dashboard. While `src` is null the section shows a
 * "coming soon" placeholder and loads no media. To go live: upload the files
 * (e.g. to /public/videos), then set src (MP4), poster (image) and captions (WebVTT).
 */
export type FounderVideo = {
  title: string;
  src: string | null;
  poster: string | null;
  captions: string | null;
  durationLabel: string;
  placeholderMessage: string;
};

export const WELCOME_VIDEO: FounderVideo = {
  title: "Welcome to Vendl",
  src: null,
  poster: null,
  captions: null,
  durationLabel: "About 1 minute",
  placeholderMessage: "A personal welcome video is coming soon.",
};

export const PRO_VIDEO: FounderVideo = {
  title: "Why We Built Vendl Pro",
  src: null,
  poster: null,
  captions: null,
  durationLabel: "About 1 minute",
  placeholderMessage: "A short introduction to Pro is coming soon.",
};
