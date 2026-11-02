import { z } from "zod";

export const socialQuery = z.object({ standId: z.string().min(1) });

export const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  gmb: "Google Business",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  x: "X",
};

export function socialPlatformLabel(platform: string): string {
  return SOCIAL_PLATFORM_LABELS[platform] ?? platform;
}

export const mobileSocialPost = z.object({
  id: z.string(),
  status: z.enum(["draft", "scheduled", "posted", "failed", "cancelled"]),
  /** Manual posts need the owner to post them from their phone at the time. */
  manual: z.boolean(),
  caption: z.string(),
  platforms: z.array(z.string()),
  photoUrl: z.string().nullable(),
  photoCount: z.number().int(),
  /** ISO times. */
  scheduledFor: z.string().nullable(),
  postedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type MobileSocialPost = z.infer<typeof mobileSocialPost>;

export const socialResponse = z.object({
  /** False until the owner opens Social for this business on the web. */
  started: z.boolean(),
  scheduled: z.array(mobileSocialPost),
  drafts: z.array(mobileSocialPost),
  history: z.array(mobileSocialPost),
});
export type SocialResponse = z.infer<typeof socialResponse>;
