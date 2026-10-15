import { z } from "zod";
import { buttonLinkSchema } from "./button-link-schema";
import { isColourValue } from "@/lib/website/sections/section-style";
import { ANNOUNCEMENT_LINK_LABEL_MAX, ANNOUNCEMENT_TEXT_MAX, type AnnouncementBar } from "./announcement-bar-view";

export * from "./announcement-bar-view";

/**
 * The strip above the header, stored as `draftConfig.announcementBar`. Missing = never set up.
 * `link` is a button-link token; with `linkLabel` it shows as a link after the text,
 * without one the whole message is the link.
 */
const colour = z.string().refine(isColourValue);

export const announcementBarSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(ANNOUNCEMENT_TEXT_MAX),
  linkLabel: z.string().max(ANNOUNCEMENT_LINK_LABEL_MAX).optional(),
  link: buttonLinkSchema.optional(),
  background: colour.optional(),
  textColour: colour.optional(),
  size: z.enum(["sm", "md"]).optional(),
  align: z.enum(["left", "centre"]).optional(),
  bold: z.boolean().optional(),
}) satisfies z.ZodType<AnnouncementBar>;

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBar = {
  enabled: true,
  text: "Fresh this week — order by Thursday for weekend pickup",
  background: "dark",
  size: "sm",
  align: "centre",
  bold: true,
};

export function parseAnnouncementBar(config: unknown): AnnouncementBar | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const parsed = announcementBarSchema.safeParse((config as Record<string, unknown>).announcementBar);
  return parsed.success ? parsed.data : null;
}

/** The first problem that would stop the bar saving, in seller words; null when fine. */
export function announcementBarProblem(bar: AnnouncementBar): string | null {
  if (bar.enabled && !bar.text.trim()) return "Add the announcement text, or switch the bar off.";
  if (bar.linkLabel?.trim() && !bar.link) return "Pick where the link goes, or clear the link text.";
  return announcementBarSchema.safeParse(bar).success ? null : "Check the announcement text and link.";
}
