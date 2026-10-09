export type ReadinessInput = {
  hasHeadline: boolean;
  hasLayout: boolean;
  productCount: number;
  canTakeCardPayments: boolean;
  publishBlockers: string[];
  isPublished: boolean;
};

export type ReadinessItem = {
  id: "details" | "layout" | "products" | "payments" | "example-text" | "publish";
  label: string;
  hint?: string;
  href: string;
  done: boolean;
  /** Optional items never block "ready"; a content-only site needs no products. */
  optional: boolean;
};

/** Short first-run checklist for the website. Pure; the page supplies the facts. */
export function websiteReadiness(input: ReadinessInput): {
  items: ReadinessItem[];
  readyToPublish: boolean;
  complete: boolean;
} {
  const items: ReadinessItem[] = [
    {
      id: "details",
      label: "Confirm your business details",
      href: "/dashboard/website/web-studio?tab=details",
      done: input.hasHeadline,
      optional: false,
    },
    {
      id: "layout",
      label: "Choose a starting layout",
      href: "/dashboard/website/studio/templates",
      done: input.hasLayout,
      optional: false,
    },
    {
      id: "products",
      label: "Add products",
      hint: "Skip this if your site is just for information.",
      href: "/dashboard/products",
      done: input.productCount > 0,
      optional: true,
    },
    {
      id: "payments",
      label: "Take card payments online",
      hint: "Without this, customers pay when they collect.",
      href: "/dashboard/settings/stripe",
      done: input.canTakeCardPayments,
      optional: true,
    },
    {
      id: "example-text",
      label: "Replace the example text",
      hint: input.publishBlockers[0],
      href: "/dashboard/website/web-studio?tab=studio",
      done: input.publishBlockers.length === 0,
      optional: false,
    },
    {
      id: "publish",
      label: "Publish on your Vendl address",
      hint: "You can connect your own domain afterwards.",
      href: "/dashboard/website/web-studio?tab=studio",
      done: input.isPublished,
      optional: false,
    },
  ];
  const required = items.filter((i) => !i.optional && i.id !== "publish");
  const readyToPublish = required.every((i) => i.done);
  return { items, readyToPublish, complete: readyToPublish && input.isPublished };
}
