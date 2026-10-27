/** Shapes of GET /topics/{id} (only the fields the writer reads). */
export type Topic = {
  id: string;
  title: string;
  angle: string | null;
  notes: string | null;
  featureRef: string | null;
  source: string;
  section: string | null;
  targetQueries: unknown;
  sourceUrls: unknown;
  targetPostSlug: string | null;
  expiresAt: string | null;
};

export type TargetPost = {
  id: string;
  slug: string;
  section: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  bodyHtml: string;
  faqs: unknown;
};
