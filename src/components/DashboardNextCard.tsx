import Link from "next/link";

const STEPS = ["Connect", "Stock", "Print", "Sell"] as const;

export default function DashboardNextCard({
  stripeConnected,
  stripeStarted,
  products,
  orderCount,
  showPreOrders,
  upgradeHref,
  upgradeLabel,
  qrHref,
}: {
  stripeConnected: boolean;
  stripeStarted: boolean;
  products: number;
  orderCount: number;
  showPreOrders: boolean;
  upgradeHref: string | null;
  upgradeLabel: string | null;
  qrHref: string;
}) {
  const done = [
    stripeConnected,
    products > 0,
    orderCount > 0,
    orderCount > 0,
  ];
  const current = done.findIndex((d) => !d);
  const active = current === -1 ? 3 : current;

  let title = "Print your QR";
  let body = "Stick it on the fridge, crate, or stall so people can pay.";
  let href = qrHref;
  let cta = "QR & print";

  if (!stripeConnected) {
    title = "Finish setup to accept cards";
    body = stripeStarted
      ? "Continue Stripe onboarding so Tap & Go can land in your account."
      : "Connect Stripe so Card / Tap & Go payments go straight to you.";
    href = "/dashboard/settings/stripe";
    cta = stripeStarted ? "Continue Stripe" : "Connect Stripe";
  } else if (products === 0) {
    title = "Add what you sell";
    body = "Name products as you sell them — dozen eggs, 500g steak.";
    href = "/dashboard/products/new";
    cta = "Add product";
  } else if (showPreOrders) {
    title = "Let them order ahead";
    body = "People are hitting empty shelves. Take a deposit before collection.";
    href = "/dashboard/products/new";
    cta = "Set up a pre-order";
  } else if (upgradeHref && upgradeLabel) {
    title = upgradeLabel;
    body = "Unlock Tap & Go and restock alerts when you are ready.";
    href = upgradeHref;
    cta = "See Pro";
  }

  return (
    <div className="relative flex min-h-[205px] flex-[1.5] overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--field)] to-[var(--leaf-dark)] p-6 text-[var(--ink-on-dark)] shadow-[0_0_38px_-18px_rgb(23_54_31_/_0.5)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--marigold)]">
          Your next move
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[23px] font-bold leading-tight">
          {title}
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-on-dark)]/75">{body}</p>
        <Link
          href={href}
          className="mt-auto inline-flex w-fit rounded-full bg-[var(--marigold)] px-5 py-2.5 text-sm font-bold text-[var(--field)]"
        >
          {cta}
        </Link>
      </div>
      <div className="ml-6 hidden w-[120px] shrink-0 flex-col sm:flex">
        {STEPS.map((label, i) => (
          <div key={label} className="flex gap-3" style={{ flex: i < 3 ? 1 : 0 }}>
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                  i === active
                    ? "bg-[var(--marigold)] text-[var(--field)]"
                    : i < active
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/45"
                }`}
              >
                {i + 1}
              </span>
              {i < 3 ? (
                <span className="my-1.5 w-0.5 flex-1 rounded-full bg-white/15" />
              ) : null}
            </div>
            <span
              className={`flex h-7 items-center text-[13px] font-semibold ${
                i === active ? "text-white" : "text-white/45"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
