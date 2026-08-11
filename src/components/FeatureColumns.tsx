import {
  CARD_PLAN_FEATURES,
  CARD_PLAN_HARDWARE_BLURB,
  CARD_PLAN_RESTOCK_BLURB,
  FREE_PLAN_FEE_BLURB,
  starterPlanFeatures,
} from "@/lib/plan-copy";

const OWNER_FREE = [
  FREE_PLAN_FEE_BLURB,
  ...starterPlanFeatures("USD"),
  CARD_PLAN_RESTOCK_BLURB,
  ...CARD_PLAN_FEATURES,
  "Add to your phone Home Screen for push alerts - no App Store install",
] as const;

const OWNER_PRO = [
  CARD_PLAN_HARDWARE_BLURB,
  "Same features as Free - no Vendl card fee",
  "Paid straight to your Stripe account: no cash box to empty, count, or bank",
] as const;

const CUSTOMER_LIVE = [
  "Scan with your phone camera. No app.",
  "See what's there and what's left.",
  "Choose options like size or flavour when a product offers them",
  "Pay cash, card, or a local method, then confirm - the owner knows.",
  "Card, Apple Pay, and Google Pay on their phone",
  "Buy Now, Pay Later (Zip, Klarna) on larger orders",
  "When card isn't on, tap “I'd have paid by card” so the owner sees demand",
  "Pre-order and pay by card to reserve for a collection day",
  "See when orders close, when to collect, and how many slots are left",
  "Get a confirmation email with your order details",
  "Opt in to hear when the stand restocks",
] as const;

type Accent = "leaf" | "marigold" | "field";

const ACCENT: Record<
  Accent,
  { bar: string; eyebrow: string; wash: string; border: string }
> = {
  leaf: {
    bar: "border-[var(--leaf)]",
    eyebrow: "text-[var(--leaf)]",
    wash: "bg-[var(--wash)]",
    border: "border-[var(--leaf)]/35",
  },
  marigold: {
    bar: "border-[var(--marigold)]",
    eyebrow: "text-[var(--marigold)]",
    wash: "bg-[color-mix(in_srgb,var(--marigold)_12%,white)]",
    border: "border-[var(--marigold)]/50",
  },
  field: {
    bar: "border-[var(--field)]",
    eyebrow: "text-[var(--field)]",
    wash: "bg-[var(--panel)]",
    border: "border-[var(--field)]/25",
  },
};

function FeatureBlock({
  eyebrow,
  title,
  accent,
  items,
}: {
  eyebrow: string;
  title: string;
  accent: Accent;
  items: readonly string[];
}) {
  const a = ACCENT[accent];
  return (
    <article
      className={`rounded-[var(--radius)] border-2 ${a.border} ${a.wash} p-[var(--pad-lg)] sm:p-8`}
    >
      <p
        className={`text-sm font-semibold uppercase tracking-[0.14em] ${a.eyebrow}`}
      >
        {eyebrow}
      </p>
      <h3
        className={`mt-2 border-l-4 pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl ${a.bar}`}
      >
        {title}
      </h3>
      <ul className="mt-6 list-disc space-y-2.5 pl-5 text-base leading-relaxed text-[var(--field)]/85 sm:text-[1.05rem]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export default function FeatureColumns() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:gap-8 sm:px-6 sm:py-12">
      <div className="relative mb-1">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          What you get
        </h2>
        <p className="mt-3 max-w-2xl pl-3 text-base text-[var(--muted)] sm:text-lg">
          Free and Pro share every feature. The only difference is the Vendl
          card fee. Shoppers get a simple scan-and-pay stall.
        </p>
      </div>

      <FeatureBlock
        eyebrow="For owners"
        title="Free - $0/mo"
        accent="leaf"
        items={OWNER_FREE}
      />
      <FeatureBlock
        eyebrow="For owners"
        title="Pro - no Vendl fee"
        accent="marigold"
        items={OWNER_PRO}
      />
      <FeatureBlock
        eyebrow="For customers"
        title="At the stall"
        accent="field"
        items={CUSTOMER_LIVE}
      />
    </section>
  );
}
