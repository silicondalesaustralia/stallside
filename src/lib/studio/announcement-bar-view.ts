import { colourCss, resolvedTextColour, type ThemePalette } from "@/lib/website/sections/colour";

export const ANNOUNCEMENT_TEXT_MAX = 160;
export const ANNOUNCEMENT_LINK_LABEL_MAX = 40;

export type AnnouncementBar = {
  enabled: boolean;
  text: string;
  linkLabel?: string;
  link?: string;
  background?: string;
  textColour?: string;
  size?: "sm" | "md";
  align?: "left" | "centre";
  bold?: boolean;
};

/** Whether the bar should appear on the site. */
export function isAnnouncementVisible(bar: AnnouncementBar | null): bar is AnnouncementBar {
  return Boolean(bar?.enabled && bar.text.trim());
}

/** Background and text CSS colours; text is white or dark ink for contrast unless chosen. */
export function announcementColours(bar: AnnouncementBar, palette: ThemePalette): { background: string; color: string } {
  const background = bar.background ?? "dark";
  const text = bar.textColour ?? resolvedTextColour({ background }, palette) ?? "light";
  return { background: colourCss(background), color: colourCss(text) };
}
