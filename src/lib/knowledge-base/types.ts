export type KnowledgeCta = {
  label: string;
  href: string;
};

export type KnowledgeIconName =
  | "start"
  | "products"
  | "orders"
  | "preorders"
  | "subscriptions"
  | "marketing"
  | "social"
  | "production"
  | "suppliers"
  | "payments"
  | "alerts"
  | "tax"
  | "account";

export type KnowledgeArticle = {
  slug: string;
  title: string;
  summary: string;
  /** YouTube or Vimeo URL. The video block only renders when this is set. */
  videoUrl?: string;
  /** Shows a "Video coming soon" placeholder where the video will go. */
  videoComingSoon?: boolean;
  /** Optional illustration under the summary (public path). */
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Short badge such as "Australia only" or "Stripe or Square". */
  availability?: string;
  /** Extra search terms that don't appear in the copy. */
  keywords?: string[];
  steps: string[];
  /** Good-to-know notes shown after the steps. */
  tips?: string[];
  related: string[];
  ctas: KnowledgeCta[];
};

export type KnowledgeCategory = {
  id: string;
  title: string;
  description: string;
  icon: KnowledgeIconName;
  articles: KnowledgeArticle[];
};

export type KnowledgeSearchEntry = {
  slug: string;
  title: string;
  summary: string;
  categoryTitle: string;
  keywords: string;
  body: string[];
};
