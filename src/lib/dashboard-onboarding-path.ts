export type DashboardOnboardingPath = "stall-first" | "card-first";

export function resolveDashboardOnboardingPath(input: {
  hasPreOrderProduct: boolean;
  preOrderPageCount: number;
  subscriptionOfferCount: number;
}): DashboardOnboardingPath {
  if (
    input.hasPreOrderProduct ||
    input.preOrderPageCount > 0 ||
    input.subscriptionOfferCount > 0
  ) {
    return "card-first";
  }
  return "stall-first";
}

export function dashboardOnboardingSteps(
  path: DashboardOnboardingPath,
): readonly string[] {
  return path === "card-first"
    ? ["Stock", "Stripe", "Share", "Sell"]
    : ["Stock", "Print", "Sell", "Connect"];
}

export function dashboardOnboardingDone(input: {
  path: DashboardOnboardingPath;
  products: number;
  orderCount: number;
  stripeConnected: boolean;
  preOrderPageCount: number;
  subscriptionOfferCount: number;
}): boolean[] {
  const stockDone = input.products > 0;
  if (input.path === "card-first") {
    const channelDone =
      input.preOrderPageCount > 0 || input.subscriptionOfferCount > 0;
    return [
      stockDone,
      input.stripeConnected,
      channelDone,
      input.orderCount > 0,
    ];
  }
  return [
    stockDone,
    input.orderCount > 0,
    input.orderCount > 0,
    input.stripeConnected,
  ];
}

export type DashboardNextMove = {
  title: string;
  body: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryCta?: string;
};

export function resolveDashboardNextMove(input: {
  path: DashboardOnboardingPath;
  stripeConnected: boolean;
  stripeStarted: boolean;
  products: number;
  orderCount: number;
  preOrderPageCount: number;
  subscriptionOfferCount: number;
  showPreOrders: boolean;
  upgradeHref: string | null;
  upgradeLabel: string | null;
  qrHref: string;
  cashAndLocalLabel: string;
  stripeMethodsPhrase: string;
}): DashboardNextMove {
  const stockDone = input.products > 0;

  if (!stockDone) {
    return {
      title: "Add what you sell",
      body: "Farm-stand items, baked goods, pre-order lines, or subscription boxes.",
      href: "/dashboard/products/new",
      cta: "Add product",
    };
  }

  if (input.path === "card-first") {
    if (!input.stripeConnected) {
      return {
        title: "Connect Stripe to take payment",
        body: "Required for pre-orders and subscription boxes. Bakers and collection-day sellers usually share a checkout link, not a stall QR.",
        href: "/dashboard/settings/stripe",
        cta: input.stripeStarted ? "Continue Stripe" : "Connect Stripe",
      };
    }
    if (
      input.preOrderPageCount === 0 &&
      input.subscriptionOfferCount === 0
    ) {
      return {
        title: "Share your order link",
        body: "Create a pre-order page or subscription offer, then share the link by email or social. No QR poster needed.",
        href: "/dashboard/pre-order-pages/new",
        cta: "New pre-order page",
        secondaryHref: "/dashboard/subscriptions/new",
        secondaryCta: "New subscription",
      };
    }
  } else if (!input.orderCount) {
    return {
      title: "Farm stand or link-based sales?",
      body: "Farm stands: print a QR at the stall. Bakers, pre-orders, and subscription boxes: connect Stripe and share a link.",
      href: input.qrHref,
      cta: "Print stall QR",
      secondaryHref: "/dashboard/settings/stripe",
      secondaryCta: input.stripeStarted
        ? "Continue Stripe setup"
        : "Connect Stripe & share link",
    };
  }

  if (!input.stripeConnected) {
    return {
      title: "Optional: take card payments",
      body: input.stripeStarted
        ? "You started Stripe but card is not live yet. Finish setup when you are ready. Cash still works."
        : `${input.cashAndLocalLabel} work already. Connect Stripe for ${input.stripeMethodsPhrase}, pre-orders, or subscription boxes.`,
      href: "/dashboard/settings/stripe",
      cta: input.stripeStarted ? "Continue Stripe" : "Connect Stripe (optional)",
    };
  }

  if (input.showPreOrders) {
    return {
      title: "Let them order ahead",
      body: "People are hitting empty shelves. Take a deposit before collection.",
      href: "/dashboard/products/new",
      cta: "Set up a pre-order",
    };
  }

  if (input.upgradeHref && input.upgradeLabel) {
    return {
      title: input.upgradeLabel,
      body: "Unlock Tap & Go and restock alerts when you are ready.",
      href: input.upgradeHref,
      cta: "See Pro",
    };
  }

  return {
    title: "You are live",
    body:
      input.path === "card-first"
        ? "Share your pre-order or subscription link anytime."
        : "Share your link or print a fresh QR anytime.",
    href:
      input.path === "card-first"
        ? "/dashboard/pre-order-pages"
        : input.qrHref,
    cta: input.path === "card-first" ? "Pre-order pages" : "QR & print",
  };
}

