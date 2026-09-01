/** Stable setup-task IDs for Getting Started (inferred completion). */

import {
  normalizeBusinessMode,
  type BusinessMode,
} from "@/lib/business-mode";

export const SETUP_TASK_IDS = [
  "CREATE_STAND",
  "CREATE_FIRST_PRODUCT",
  "CONNECT_PAYMENTS",
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
    id: "CREATE_STAND",
    hrefKey: "businesses_new",
    order: 1,
    effort: "2 min",
  },
  {
    id: "CREATE_FIRST_PRODUCT",
    hrefKey: "products_new",
    order: 2,
    effort: "2 min",
  },
  {
    id: "CONNECT_PAYMENTS",
    hrefKey: "stripe",
    order: 3,
    effort: "5 min",
  },
  {
    id: "GENERATE_QR",
    hrefKey: "qr",
    order: 4,
    effort: "2 min",
  },
  {
    id: "CONFIGURE_ALERTS",
    hrefKey: "notifications",
    order: 5,
    effort: "1 min",
  },
  {
    id: "PREVIEW_STAND",
    hrefKey: "preview",
    order: 6,
    effort: "1 min",
  },
  {
    id: "FIRST_SALE",
    hrefKey: "orders",
    order: 7,
    effort: "—",
  },
];

function copyForMode(mode: BusinessMode): Record<
  SetupTaskId,
  { title: string; description: string; required: boolean }
> {
  if (mode === "FOOD_BUSINESS") {
    return {
      CREATE_STAND: {
        title: "Set up your storefront",
        description:
          "We create a public shop URL for you (same system as stands).",
        required: true,
      },
      CREATE_FIRST_PRODUCT: {
        title: "Add your first product",
        description: "Name, price, and stock for online orders.",
        required: true,
      },
      CONNECT_PAYMENTS: {
        title: "Connect card payments",
        description: "Optional now — connect Stripe for Tap & Go anytime.",
        required: false,
      },
      GENERATE_QR: {
        title: "Share your shop link or QR",
        description: "Optional for food businesses — useful for markets too.",
        required: false,
      },
      CONFIGURE_ALERTS: {
        title: "Turn on sale alerts",
        description: "Email or phone push when something sells.",
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

  const farmish = mode === "FARM_STAND";
  return {
    CREATE_STAND: {
      title: farmish ? "Create your farm stand" : "Create your farm stand",
      description: "Add a stand with a public URL for QR checkout.",
      required: true,
    },
    CREATE_FIRST_PRODUCT: {
      title: "Add your first product",
      description: "Name, price, and stock so shoppers have something to buy.",
      required: true,
    },
    CONNECT_PAYMENTS: {
      title: "Connect card payments",
      description:
        "Optional. Cash and PayID work without Stripe. Connect for Tap & Go.",
      required: false,
    },
    GENERATE_QR: {
      title: "Print or download your QR sign",
      description: "Generate a poster for the stall fence or table.",
      required: true,
    },
    CONFIGURE_ALERTS: {
      title: "Turn on sale alerts",
      description: "Get email or phone push when something sells or runs low.",
      required: false,
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

/** @deprecated Prefer setupTaskDefsForMode */
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
    case "CREATE_STAND":
      return facts.standCount > 0;
    case "CREATE_FIRST_PRODUCT":
      return facts.productCount > 0;
    case "CONNECT_PAYMENTS":
      return facts.stripeChargesEnabled;
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
