import { z } from "zod";

export const qrPosterSchema = z.object({
  title: z.string().trim().max(80),
  locationLabel: z.string().trim().max(120),
  qrCallout: z.string().max(8000),
  qrSignMessage: z.string().max(8000),
  description: z.string().max(8000),
  showCta: z.boolean(),
  ctaText: z.string().trim().max(60),
  showInstructions: z.boolean(),
  showBundles: z.boolean(),
  showFirstOrder: z.boolean(),
  showFreshness: z.boolean(),
  showHowItWorks: z.boolean(),
});

export type QrPoster = z.infer<typeof qrPosterSchema>;

export type PosterStandDefaults = {
  name: string;
  locationLabel: string | null;
  qrCallout: string | null;
  qrSignMessage: string | null;
  description: string | null;
  posterShowCta: boolean;
  posterCtaText: string | null;
  posterShowInstructions: boolean;
  posterShowBundles: boolean;
  posterShowFirstOrder: boolean;
  posterShowFreshness: boolean;
  posterShowHowItWorks: boolean;
};

export const DEFAULT_CTA = "SCAN TO SHOP";

/** The business's sign settings, used for QR codes that haven't been customised. */
export function posterFromStand(stand: PosterStandDefaults): QrPoster {
  return {
    title: stand.name,
    locationLabel: stand.locationLabel ?? "",
    qrCallout: stand.qrCallout ?? "",
    qrSignMessage: stand.qrSignMessage ?? "",
    description: stand.description ?? "",
    showCta: stand.posterShowCta,
    ctaText: stand.posterCtaText ?? DEFAULT_CTA,
    showInstructions: stand.posterShowInstructions,
    showBundles: stand.posterShowBundles,
    showFirstOrder: stand.posterShowFirstOrder,
    showFreshness: stand.posterShowFreshness,
    showHowItWorks: stand.posterShowHowItWorks,
  };
}

/** Saved poster over the business defaults; unreadable or missing fields fall back. */
export function resolvePoster(raw: unknown, stand: PosterStandDefaults): QrPoster {
  const base = posterFromStand(stand);
  const parsed = qrPosterSchema.partial().safeParse(raw ?? {});
  return parsed.success ? { ...base, ...parsed.data } : base;
}
