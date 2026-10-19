import type { ComponentType } from "react";
import type { FaqItem } from "@/lib/schema";

export type NewsArticleImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type NewsAuthor = {
  slug: string;
  name: string;
  bio: string;
  jobTitle: string;
  /** Profile or about URL */
  url?: string;
  sameAs?: string[];
  /** "organization" credits the publisher itself (no Person node in schema). */
  kind?: "person" | "organization";
  /** Site path of the author's profile page (/authors/{slug}). */
  profilePath?: string;
  imageUrl?: string;
  knowsAbout?: string[];
};

export type NewsSoftwareOffer = {
  name: string;
  price: string;
  priceCurrency: string;
  url: string;
  description: string;
  unitText?: string;
};

export type NewsComparedSoftware = {
  id: string;
  name: string;
  url: string;
  description: string;
  applicationSubCategory: string;
  operatingSystem: string;
  featureList: string[];
  offers: NewsSoftwareOffer[];
  listLabel: string;
};

export type NewsArticlePart = {
  name: string;
  cssSelector: string;
};

export type NewsArticleMeta = {
  slug: string;
  /** Defaults to /farms-stand-news/{slug}; guides live under /guides. */
  canonicalPath?: string;
  /** Breadcrumb parent; defaults to Farm Stand News. */
  sectionLabel?: string;
  sectionPath?: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  /** ISO 8601 datetime preferred */
  publishedAt: string;
  updatedAt?: string;
  author: NewsAuthor;
  image?: NewsArticleImage;
  /** When "body-only", skip the hero image (image still used for OG/schema). */
  featuredImagePlacement?: "hero" | "body-only";
  alternativeHeadline?: string;
  articleSection?: string[];
  keywords?: string;
  wordCount?: number;
  speakableSelectors?: string[];
  mentions?: Array<{ name: string; sameAs?: string; type?: "Thing" | "Organization" }>;
  citations?: Array<{ name: string; url: string }>;
  audienceType?: string;
  hasPart?: NewsArticlePart[];
  comparedSoftware?: NewsComparedSoftware[];
  faqs?: FaqItem[];
  /** Section headings (with anchor ids) for the "On this page" list. */
  headings?: Array<{ id: string; text: string }>;
};

export type NewsArticle = NewsArticleMeta & {
  Content: ComponentType;
};
