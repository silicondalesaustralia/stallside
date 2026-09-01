/** Stable setup-task IDs for Getting Started (inferred completion). */

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
  /** Path builder uses stand id when needed */
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

export const SETUP_TASK_DEFS: readonly SetupTaskDef[] = [
  {
    id: "CREATE_STAND",
    title: "Create your farm stand",
    description: "Add a stand with a public URL for QR checkout.",
    hrefKey: "businesses_new",
    required: true,
    order: 1,
    effort: "2 min",
  },
  {
    id: "CREATE_FIRST_PRODUCT",
    title: "Add your first product",
    description: "Name, price, and stock so shoppers have something to buy.",
    hrefKey: "products_new",
    required: true,
    order: 2,
    effort: "2 min",
  },
  {
    id: "CONNECT_PAYMENTS",
    title: "Connect card payments",
    description:
      "Optional. Cash and PayID work without Stripe. Connect for Tap & Go.",
    hrefKey: "stripe",
    required: false,
    order: 3,
    effort: "5 min",
  },
  {
    id: "GENERATE_QR",
    title: "Print or download your QR sign",
    description: "Generate a poster for the stall fence or table.",
    hrefKey: "qr",
    required: true,
    order: 4,
    effort: "2 min",
  },
  {
    id: "CONFIGURE_ALERTS",
    title: "Turn on sale alerts",
    description: "Get email or phone push when something sells or runs low.",
    hrefKey: "notifications",
    required: false,
    order: 5,
    effort: "1 min",
  },
  {
    id: "PREVIEW_STAND",
    title: "Preview your live stand",
    description: "Open the public checkout page on your phone.",
    hrefKey: "preview",
    required: false,
    order: 6,
    effort: "1 min",
  },
  {
    id: "FIRST_SALE",
    title: "Complete a sale",
    description: "A cash or card order means you are live.",
    hrefKey: "orders",
    required: true,
    order: 7,
    effort: "—",
  },
] as const;

export type SetupFacts = {
  standCount: number;
  productCount: number;
  stripeChargesEnabled: boolean;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  orderCount: number;
  /** Soft signal: owner opened the QR studio at least once this session is not tracked; use order or stand. */
  hasStand: boolean;
  standSlug: string | null;
  selectedStandId: string | null;
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
      return facts.standSlug ? `/s/${facts.standSlug}` : "/dashboard/businesses/new";
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
      // No visit tracking yet — cleared by first counted sale (same soft signal as go-live).
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
  return SETUP_TASK_DEFS.map((def) => ({
    ...def,
    complete: isSetupTaskComplete(def.id, facts),
    href: setupTaskHref(def.hrefKey, facts),
  }));
}

/** Prefer next incomplete required task; otherwise first incomplete optional. */
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
