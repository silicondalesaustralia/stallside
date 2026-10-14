import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { extractBlogTopics } from "@/lib/studio/blog";
import { withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { extractStorefrontRedirects } from "@/lib/studio/redirects";
import { resolveSiteSlugOwner, shadowedSiteSlugs, type SiteSlugOwner } from "./site-slugs";

export type ClashInput = {
  configRaw: unknown;
  categories: { id: string; slug: string; title: string }[];
  standCount: number;
  isPublished: boolean;
  preOrderMenuSlugs: string[];
  preOrderPageSlugs: string[];
  subscriptionOfferSlugs: string[];
};

export type ClashIssue = { level: "block" | "warn"; message: string };

function owners(input: ClashInput): SiteSlugOwner[] {
  const pages = ensureCustomPages(input.configRaw).filter((p) => p.enabled && p.routeKind === "custom");
  return [
    ...pages.map((p) => ({ kind: "page" as const, id: p.id, slug: p.slug, label: p.title })),
    ...input.categories.map((c) => ({ kind: "category" as const, id: c.id, slug: c.slug, label: c.title })),
    ...withDefaultBlogTopic(extractBlogTopics(input.configRaw)).map((t) => ({
      kind: "blogCategory" as const,
      id: t.id,
      slug: t.slug,
      label: t.name,
    })),
  ];
}

/** Everything that would break or be hidden once a site switches to clean URLs. */
export function siteClashReport(input: ClashInput): ClashIssue[] {
  const issues: ClashIssue[] = [];
  const all = owners(input);
  for (const o of shadowedSiteSlugs(all)) {
    const winner = resolveSiteSlugOwner(o.slug, all);
    issues.push({
      level: "block",
      message: winner
        ? `${o.kind} "${o.label}" /${o.slug} is hidden by ${winner.kind} "${winner.label}"`
        : `${o.kind} "${o.label}" /${o.slug} is a reserved path`,
    });
  }
  const livePaths = new Set(all.map((o) => `/${o.slug}`));
  for (const r of extractStorefrontRedirects(input.configRaw)) {
    if (r.enabled && livePaths.has(r.fromPath)) {
      issues.push({ level: "block", message: `redirect ${r.fromPath} → ${r.toPath} hides a live page/category` });
    }
  }
  for (const slug of input.preOrderPageSlugs.filter((s) => input.preOrderMenuSlugs.includes(s))) {
    issues.push({ level: "warn", message: `/pre-orders/${slug} shows the pre-order drop menu, not the pre-order page` });
  }
  if (input.subscriptionOfferSlugs.includes("manage")) {
    issues.push({ level: "block", message: `subscription offer "manage" clashes with /subscriptions/manage` });
  }
  if (input.isPublished && input.standCount > 1) {
    issues.push({ level: "warn", message: `${input.standCount} stands — confirm which stand powers the website` });
  }
  return issues;
}
