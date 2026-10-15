import type { FaqItem } from "@/lib/studio/faq-view";
import { breadcrumbListSchema } from "@/lib/storefront/technical-seo/breadcrumbs";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import type { SiteFacts } from "../site-facts";
import { businessNode, founderNode } from "./business";
import { clean, graphIds, languageFor, type JsonLdNode } from "./clean";
import { faqPageNodes } from "./content";

export type WebPageType =
  | "WebPage"
  | "CollectionPage"
  | "ItemPage"
  | "AboutPage"
  | "ContactPage"
  | "FAQPage"
  | "CheckoutPage";

/** What a storefront page says about itself; the shell turns it into one connected JSON-LD graph. */
export type PageSeo = {
  /** Public path, e.g. "/shop/veg". Omit for the home page. */
  path?: string;
  type?: WebPageType;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  /** Home first, current page last. */
  breadcrumb?: { label: string; path?: string }[];
  /** Extra nodes (Product, ItemList, BlogPosting…). The first is the page's main entity. */
  nodes?: (JsonLdNode | null | PageNodeBuilder)[];
  faq?: FaqItem[];
};

export type PageNodeContext = { facts: SiteFacts; pageUrl: string; language: string };
export type PageNodeBuilder = (page: PageNodeContext) => JsonLdNode | null;

/** Absolute URL for any storefront path. */
export function siteUrl(page: PageNodeContext, path: string): string {
  return pageUrlFor(page.facts, path);
}

export function pageUrlFor(facts: SiteFacts, path?: string): string {
  return storefrontPublicUrl(facts.slug, {
    path: path && path !== "/" ? path : undefined,
    primaryCustomHostname: facts.primaryCustomHostname,
  });
}

/** Business, website and founder: on every page, identical ids everywhere. */
function siteNodes(facts: SiteFacts): JsonLdNode[] {
  const ids = graphIds(facts.homeUrl, facts.homeUrl);
  const founder = founderNode(facts);
  return [
    businessNode(facts),
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: facts.homeUrl,
      name: facts.name,
      alternateName: facts.profile.alternateNames,
      description: facts.profile.slogan,
      inLanguage: languageFor(facts.currency),
      publisher: { "@id": ids.business },
    },
    ...(founder ? [founder] : []),
  ];
}

/** Without `seo` (cart, checkout…) only the business and website are described. */
export function buildPageGraph(facts: SiteFacts, seo?: PageSeo) {
  const graph = siteNodes(facts);
  if (seo) graph.push(...pageNodes(facts, seo));
  return { "@context": "https://schema.org", "@graph": clean(graph) };
}

function pageNodes(facts: SiteFacts, seo: PageSeo): JsonLdNode[] {
  const pageUrl = pageUrlFor(facts, seo.path);
  const ids = graphIds(facts.homeUrl, pageUrl);
  const language = languageFor(facts.currency);
  const isHome = !seo.path || seo.path === "/";
  const nodeCtx: PageNodeContext = { facts, pageUrl, language };
  const nodes = (seo.nodes ?? [])
    .map((n) => (typeof n === "function" ? n(nodeCtx) : n))
    .filter((n): n is JsonLdNode => !!n);
  const questions = faqPageNodes(pageUrl, seo.faq ?? []);
  const type = seo.type ?? "WebPage";
  const pageType = questions.length && type !== "FAQPage" ? [type, "FAQPage"] : type;
  const hasCrumbs = (seo.breadcrumb?.length ?? 0) > 1;
  const mainEntity = nodes[0]?.["@id"];
  const aboutBusiness = isHome || type === "AboutPage" || type === "ContactPage";

  const graph: JsonLdNode[] = [
    {
      "@type": pageType,
      "@id": ids.webpage,
      url: pageUrl,
      name: seo.name ?? facts.name,
      description: seo.description ?? undefined,
      inLanguage: language,
      isPartOf: { "@id": ids.website },
      about: aboutBusiness ? { "@id": ids.business } : undefined,
      primaryImageOfPage: seo.imageUrl ? { "@type": "ImageObject", url: seo.imageUrl } : undefined,
      breadcrumb: hasCrumbs ? { "@id": ids.breadcrumb } : undefined,
      mainEntity: questions.length
        ? questions.map((q) => ({ "@id": q["@id"] }))
        : typeof mainEntity === "string"
          ? { "@id": mainEntity }
          : undefined,
    },
  ];

  if (hasCrumbs && seo.breadcrumb) {
    graph.push(breadcrumbListSchema(facts.slug, seo.breadcrumb, pageUrl, facts.primaryCustomHostname));
  }
  graph.push(...questions, ...nodes);
  return graph;
}
