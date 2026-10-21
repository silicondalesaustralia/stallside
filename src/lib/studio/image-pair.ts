export const IMAGE_STYLES = ["single", "pair"] as const;
export type ImageStyle = (typeof IMAGE_STYLES)[number];

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  single: "One photo",
  pair: "Two photos",
};

export function parseImageStyle(raw: unknown): ImageStyle {
  return raw === "pair" ? "pair" : "single";
}

/** Two-photo layout shows when chosen and there's something to show (editors always see it). */
export function showImagePair(style: ImageStyle, secondImageUrl: string | null, editable: boolean): boolean {
  return style === "pair" && (Boolean(secondImageUrl) || editable);
}
