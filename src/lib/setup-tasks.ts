/** Getting Started tasks — inferred completion; progressive after short gate. */

import {
  normalizeBusinessMode,
  type BusinessMode,
} from "@/lib/business-mode";

export const SETUP_TASK_IDS = [
  "CHOOSE_SELL_CATEGORIES",
  "CONFIGURE_FULFILMENT",
  "CREATE_STAND",
  "CREATE_FIRST_PRODUCT",
  "CONNECT_PAYMENTS",
  "BRANDING",
  "GENERATE_QR",
  "CONFIGURE_ALERTS",
  "PREVIEW_STAND",
  "FIRST_SALE",
] as const;

export type SetupTaskId = (typeof SETUP_TASK_IDS)[number];

export type SetupTaskDef = {
  id: SetupTaskId;
  title: string;
  description: string;
  hrefKey:
    | "setup_sell"
    | "setup_fulfilment"
    | "setup_branding"
    | "businesses_new"
    | "products_new"
    | "stripe"
    | "qr"
    | "notifications"
    | "preview"
    | "orders";
  required: boolean;
  order: number;
  effort: string;
};

const BASE_DEFS: Omit<SetupTaskDef, "required" | "title" | "description">[] = [
  {
    id: "CHOOSE_SELL_CATEGORIES",
    hrefKey: "setup_sell",
    order: 1,
    effort: "1 min",
  },
  {
    id: "CONFIGURE_FULFILMENT",
    hrefKey: "setup_fulfilment",
    order: 2,
    effort: "1 min",
  },
  {
    id: "CREATE_STAND",
    hrefKey: "businesses_new",
    order: 3,
    effort: "2 min",
  },
  {
    id: "CREATE_FIRST_PRODUCT",
    hrefKey: "products_new",
    order: 4,
    effort: "2 min",
  },
  {
    id: "CONNECT_PAYMENTS",
    hrefKey: "stripe",
    order: 5,
    effort: "5 min",
  },
  {
    id: "BRANDING",
    hrefKey: "setup_branding",
    order: 6,
    effort: "1 min",
  },
  {
    id: "GENERATE_QR",
    hrefKey: "qr",
    order: 7,
    effort: "2 min",
  },
  {
    id: "CONFIGURE_ALERTS",
    hrefKey: "notifications",
    order: 8,
    effort: "1 min",
  },
  {
    id: "PREVIEW_STAND",
    hrefKey: "preview",
    order: 9,
    effort: "1 min",
  },
  {
    id: "FIRST_SALE",
    hrefKey: "orders",
    order: 10,
    effort: "—",
  },
];

function copyForMode(mode: BusinessMode): Record<
  SetupTaskId,
  { title: string; description: string; required: boolean }
> {
  const sharedEarly = {
    CHOOSE_SELL_CATEGORIES: {
      title: "What do you sell?",
      description: "Optional — personalises tips. Never locks your catalogue.",
      required: false,
    },
    CONFIGURE_FULFILMENT: {
      title: "How will you fulfil orders?",
      description: "Pickup, delivery, pre-orders, stand — pick what you offer.",
      required: false,
    },
    CONNECT_PAYMENTS: {
      title: "Connect card payments",
      description:
        "Optional. Cash and PayID work without Stripe. Connect for Tap & Go.",
      required: false,
    },
    BRANDING: {
      title: "Add your brand colours",
      description: "Primary and accent on your public shop or stand.",
      required: false,
    },
    CONFIGURE_ALERTS: {
      title: "Turn on sale alerts",
      description: "Email or phone push when something sells.",
      required: false,
    },
  } as const;

  if (mode === "FOOD_BUSINESS") {
    return {
      ...sharedEarly,
      CREATE_STAND: {
        title: "Confirm your shop URL",
        description: "Your catalogue has a public link — open it anytime.",
        required: true,
      },
      CREATE_FIRST_PRODUCT: {
        title: "Add your first product",
        description: "Name, price, and stock so customers can order.",
        required: true,
      },
      GENERATE_QR: {
        title: "Share your shop link or QR",
        description: "Optional — useful for markets and posters.",
        required: false,
      },
      PREVIEW_STAND: {
        title: "Preview your shop",
        description: "Open the public storefront on your phone.",
        required: false,
      },
      FIRST_SALE: {
        title: "Receive your first order",
        description: "A completed order means you are live.",
        required: true,
      },
    };
  }

  return {
    ...sharedEarly,
    CREATE_STAND: {
      title:
        mode === "BOTH" ? "Create your farm stand" : "Create your farm stand",
      description: "Add a stand with a public URL for QR checkout.",
      required: true,
    },
    CREATE_FIRST_PRODUCT: {
      title: "Add your first product",
      description: "Name, price, and stock so shoppers have something to buy.",
      required: true,
    },
    GENERATE_QR: {
      title: "Print or download your QR sign",
      description: "Generate a poster for the stall fence or table.",
      required: true,
    },
    PREVIEW_STAND: {
      title: "Preview your live stand",
      description: "Open the public checkout page on your phone.",
      required: false,
    },
    FIRST_SALE: {
      title: "Complete a sale",
      description: "A cash or card order means you are live.",
      required: true,
    },
  };
}

export const SETUP_TASK_DEFS: readonly SetupTaskDef[] = setupTaskDefsForMode(
  "BOTH",
);

export function setupTaskDefsForMode(mode: BusinessMode): SetupTaskDef[] {
  const copy = copyForMode(mode);
  return BASE_DEFS.map((base) => ({
    ...base,
    ...copy[base.id],
  }));
}

export type SetupFacts = {
  standCount: number;
  productCount: number;
  stripeChargesEnabled: boolean;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  orderCount: number;
  hasStand: boolean;
  standSlug: string | null;
  selectedStandId: string | null;
  businessMode?: string | null;
  sellCategoriesCount?: number;
  fulfilmentIntentsCount?: number;
  hasBranding?: boolean;
};

export type SetupTaskStatus = SetupTaskDef & {
  complete: boolean;
  href: string;
};

export function setupTaskHref(
  key: SetupTaskDef["hrefKey"],
  facts: Pick<SetupFacts, "selectedStandId" | "standSlug">,
): string {
  const id = facts.selectedStandId;
  switch (key) {
    case "setup_sell":
      return "/dashboard/setup/sell";
    case "setup_fulfilment":
      return "/dashboard/setup/fulfilment";
    case "setup_branding":
      return "/dashboard/setup/branding";
    case "businesses_new":
      return id ? `/dashboard/businesses/${id}` : "/dashboard/businesses/new";
    case "products_new":
      return "/dashboard/products/new";
    case "stripe":
      return "/dashboard/settings/stripe";
    case "qr":
      return id
        ? `/dashboard/businesses/${id}/qr`
        : "/dashboard/businesses/new";
    case "notifications":
      return "/dashboard/notifications";
    case "preview":
      return facts.standSlug
        ? `/s/${facts.standSlug}`
        : "/dashboard/businesses/new";
    case "orders":
      return "/dashboard/orders";
  }
}

export function isSetupTaskComplete(
  id: SetupTaskId,
  facts: SetupFacts,
): boolean {
  switch (id) {
    case "CHOOSE_SELL_CATEGORIES":
      return (facts.sellCategoriesCount ?? 0) > 0;
    case "CONFIGURE_FULFILMENT":
      return (facts.fulfilmentIntentsCount ?? 0) > 0;
    case "CREATE_STAND":
      return facts.standCount > 0;
    case "CREATE_FIRST_PRODUCT":
      return facts.productCount > 0;
    case "CONNECT_PAYMENTS":
      return facts.stripeChargesEnabled;
    case "BRANDING":
      return Boolean(facts.hasBranding);
    case "GENERATE_QR":
      return facts.orderCount > 0;
    case "CONFIGURE_ALERTS":
      return facts.emailAlertsEnabled || facts.pushAlertsEnabled;
    case "PREVIEW_STAND":
      return facts.hasStand && facts.productCount > 0;
    case "FIRST_SALE":
      return facts.orderCount > 0;
  }
}

export function resolveSetupTasks(facts: SetupFacts): SetupTaskStatus[] {
  const mode = normalizeBusinessMode(facts.businessMode);
  return setupTaskDefsForMode(mode).map((def) => ({
    ...def,
    complete: isSetupTaskComplete(def.id, facts),
    href: setupTaskHref(def.hrefKey, facts),
  }));
}

export function resolveNextSetupTask(
  tasks: SetupTaskStatus[],
): SetupTaskStatus | null {
  const standDone = Boolean(
    tasks.find((t) => t.id === "CREATE_STAND")?.complete,
  );
  const firstProduct = tasks.find(
    (t) => t.id === "CREATE_FIRST_PRODUCT" && !t.complete,
  );
  // Strong primary CTA once a location/shop exists.
  if (standDone && firstProduct) return firstProduct;
  return (
    tasks.find((t) => t.required && !t.complete) ??
    tasks.find((t) => !t.complete) ??
    null
  );
}

export function setupProgressSummary(tasks: SetupTaskStatus[]) {
  const required = tasks.filter((t) => t.required);
  const requiredDone = required.filter((t) => t.complete).length;
  const allDone = tasks.filter((t) => t.complete).length;
  const next = resolveNextSetupTask(tasks);
  const launched =
    required.length > 0 && required.every((t) => t.complete);
  return {
    requiredTotal: required.length,
    requiredDone,
    allDone,
    allTotal: tasks.length,
    next,
    launched,
    percent:
      required.length === 0
        ? 100
        : Math.round((requiredDone / required.length) * 100),
  };
}
