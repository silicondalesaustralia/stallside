import type { CSSProperties, ReactNode } from "react";
import type { StudioMetadata } from "@/lib/studio/types";
import type { HeroLook } from "@/lib/studio/hero-look";

/** Everything a hero style needs, worked out once by StudioHeroBlock. */
export type HeroView = {
  meta: StudioMetadata;
  editable: boolean;
  headline: string;
  supportingText: string;
  ctaLabel: string;
  showCta: boolean;
  /** Headline / text with the branding fallbacks applied. */
  title: string;
  subtitle: string;
  brandHeadline: string;
  heroImage: string | null;
  look: HeroLook;
  /** Main and second buttons; null when neither shows. */
  buttons: ReactNode;
  sectionClass: string;
  style: CSSProperties | undefined;
};
