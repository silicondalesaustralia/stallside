import { z } from "zod";

export const mobileGuideSummary = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  hasVideo: z.boolean(),
  comingSoon: z.boolean(),
});
export type MobileGuideSummary = z.infer<typeof mobileGuideSummary>;

export const guidesResponse = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      guides: z.array(mobileGuideSummary),
    }),
  ),
});
export type GuidesResponse = z.infer<typeof guidesResponse>;

export const guideResponse = z.object({
  guide: mobileGuideSummary,
  /** YouTube / Vimeo page to open; null when there's no video yet. */
  videoUrl: z.string().nullable(),
  /** Site-relative image path, e.g. "/guides/alerts-settings.jpg". */
  image: z
    .object({
      path: z.string(),
      alt: z.string(),
      aspectRatio: z.number().positive().nullable(),
    })
    .nullable(),
  steps: z.array(z.string()),
  /** Dashboard paths. */
  links: z.array(z.object({ label: z.string(), href: z.string() })),
  related: z.array(mobileGuideSummary),
});
export type GuideResponse = z.infer<typeof guideResponse>;
