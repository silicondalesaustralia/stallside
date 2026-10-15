import type { AssistantContext } from "../context/types";
import type { BriefData, PolicyPageId } from "../brief/schema";
import type { ModelSectionType } from "../ai/schemas";
import { isAssistantPageId, pageOptions, POLICY_LABELS } from "../pages/catalogue";
import { availableSections } from "./section-rules";

export type PageTargetKind = "home" | "about" | "contact" | "faq" | "visit" | "reviews" | "blog" | "custom" | "policy";

export type PageTarget = {
  key: string;
  kind: PageTargetKind;
  title: string;
  navLabel: string;
  purpose: string;
  allowedSections: ModelSectionType[];
  requiredSections: ModelSectionType[];
  maxSections: number;
  /** Default section order when the model fails or omits the page. */
  defaultSections: ModelSectionType[];
  policy?: PolicyPageId;
};

type Spec = Omit<PageTarget, "key" | "allowedSections" | "defaultSections"> & { prefer: ModelSectionType[] };

const SPECS: Record<string, Spec> = {
  HOME: {
    kind: "home", title: "Home", navLabel: "Home", purpose: "Introduce the business and lead customers to its main goal.",
    requiredSections: ["hero"], maxSections: 8,
    prefer: ["hero", "productGrid", "nextDrop", "imageText", "categories", "pickup", "reviews", "signup"],
  },
  ABOUT: {
    kind: "about", title: "About", navLabel: "About", purpose: "Tell the business story using only confirmed facts.",
    requiredSections: [], maxSections: 5, prefer: ["hero", "about", "imageText", "text"],
  },
  CONTACT: {
    kind: "contact", title: "Contact", navLabel: "Contact", purpose: "Let customers get in touch.",
    requiredSections: ["contactForm"], maxSections: 4, prefer: ["text", "contactForm", "pickup"],
  },
  FAQ: {
    kind: "faq", title: "FAQ", navLabel: "FAQ", purpose: "Answer common questions with confirmed facts only.",
    requiredSections: ["faq"], maxSections: 3, prefer: ["faq", "contactForm"],
  },
  VISIT: {
    kind: "visit", title: "Visit us", navLabel: "Visit", purpose: "Explain where, when and how customers collect or visit.",
    requiredSections: [], maxSections: 5, prefer: ["hero", "farmStand", "pickup", "text", "payments"],
  },
  REVIEWS: {
    kind: "reviews", title: "Reviews", navLabel: "Reviews", purpose: "Show approved customer reviews.",
    requiredSections: ["reviews"], maxSections: 3, prefer: ["text", "reviews"],
  },
  BLOG: {
    kind: "blog", title: "Blog", navLabel: "Blog", purpose: "A short intro above the seller's existing blog posts.",
    requiredSections: [], maxSections: 1, prefer: ["text"],
  },
};

function build(key: string, spec: Spec, available: Set<ModelSectionType>): PageTarget {
  const { prefer, ...rest } = spec;
  const allowed = [...available].filter((t) => key === "HOME" || t !== "hero" || prefer.includes("hero"));
  const scoped: ModelSectionType[] = spec.kind === "blog" ? ["text"] : allowed;
  const defaults = prefer.filter((t) => scoped.includes(t));
  return { key, ...rest, allowedSections: scoped, defaultSections: defaults.length ? defaults : ["text"] };
}

/** Pages to build, in order. SHOP is enabled but uses the existing commerce layout. */
export function pageTargets(ctx: AssistantContext, brief: BriefData): PageTarget[] {
  const available = availableSections(ctx);
  const usable = new Set(pageOptions(ctx, brief).filter((o) => o.available).map((o) => o.id));
  const selected = ["HOME", ...brief.pages.selected.filter((id) => id !== "HOME")];
  const targets: PageTarget[] = [];
  for (const id of selected) {
    if (!isAssistantPageId(id) || !usable.has(id) || id === "SHOP") continue;
    const spec = SPECS[id];
    if (spec) targets.push(build(id, spec, available));
  }
  for (const page of brief.pages.custom) {
    if (!page.title.trim()) continue;
    const spec: Spec = {
      kind: "custom", title: page.title, navLabel: page.title.slice(0, 24), purpose: page.purpose,
      requiredSections: [], maxSections: 5, prefer: ["hero", "text", "imageText", "faq"],
    };
    targets.push(build(`custom:${page.id}`, spec, available));
  }
  for (const policy of brief.pages.policies) {
    targets.push({
      key: `policy:${policy}`, kind: "policy", title: POLICY_LABELS[policy], navLabel: POLICY_LABELS[policy],
      purpose: "A plain-language policy draft from confirmed business facts, for the seller to review.",
      allowedSections: ["text"], requiredSections: ["text"], maxSections: 4, defaultSections: ["text"], policy,
    });
  }
  return targets;
}

export function shopSelected(ctx: AssistantContext, brief: BriefData): boolean {
  return brief.pages.selected.includes("SHOP") && ctx.catalogue.productCount > 0;
}
