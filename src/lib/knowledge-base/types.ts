export type KnowledgeCta = {
  label: string;
  href: string;
};

export type KnowledgeArticle = {
  slug: string;
  title: string;
  summary: string;
  /** YouTube or Vimeo URL — null until you drop in a tutorial */
  videoUrl: string | null;
  comingSoon?: boolean;
  steps: string[];
  related: string[];
  ctas: KnowledgeCta[];
};

export type KnowledgeCategory = {
  id: string;
  title: string;
  articles: KnowledgeArticle[];
};
