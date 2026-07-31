import {
  CARD_PLAN_FEATURES,
  CARD_PLAN_HARDWARE_BLURB,
  CARD_PLAN_RESTOCK_BLURB,
  STARTER_PLAN_FEATURES,
} from "@/lib/plan-copy";

const OWNER_STARTER = [
  ...STARTER_PLAN_FEATURES,
  "Add to your phone Home Screen for push alerts - no App Store install",
] as const;

const OWNER_PRO = [
  "Tap & Go on Pro - card, Apple Pay, Google Pay",
  CARD_PLAN_HARDWARE_BLURB,
  "Paid straight to your Stripe account: no cash box to empty, count, or bank",
  CARD_PLAN_RESTOCK_BLURB,
  ...CARD_PLAN_FEATURES,
] as const;

const OWNER_SOON = ["PayPal at the gate"] as const;

const CUSTOMER_LIVE = [
  "Scan with your phone camera. No app.",
  "See what's there and what's left.",
  "Choose options like size or flavour when a product offers them",
  "Pay cash and PayID (Australia only), then confirm - the owner knows.",
  "Tap & Go - card, Apple Pay, Google Pay on your phone",
  "When card isn't on, tap “I'd have paid by card” so the owner sees demand",
  "Pre-order and pay by card to reserve for a collection day",
  "See when orders close, when to collect, and how many slots are left",
  "Get a confirmation email with your order details",
  "Opt in to hear when the stand restocks",
] as const;

const CUSTOMER_SOON = ["PayPal checkout"] as const;

function FeatureGroupList({
  heading,
  items,
}: {
  heading: string;
  items: readonly string[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--leaf)]">
        {heading}
      </p>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function FeatureColumn({
  title,
  groups,
  soon,
}: {
  title: string;
  groups: readonly { heading: string; items: readonly string[] }[];
  soon: readonly string[];
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)]">
      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {title}
      </h3>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <FeatureGroupList
            key={group.heading}
            heading={group.heading}
            items={group.items}
          />
        ))}
      </div>
      {soon.length > 0 ? (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Coming soon
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
            {soon.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default function FeatureColumns() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-10 sm:px-6 sm:py-12 lg:grid-cols-2">
      <FeatureColumn
        title="For owners"
        groups={[
          { heading: "Starter — free forever", items: OWNER_STARTER },
          { heading: "Pro", items: OWNER_PRO },
        ]}
        soon={OWNER_SOON}
      />
      <FeatureColumn
        title="For customers"
        groups={[{ heading: "At the stall", items: CUSTOMER_LIVE }]}
        soon={CUSTOMER_SOON}
      />
    </section>
  );
}
