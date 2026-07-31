import LandingFeatureCallout from "@/components/LandingFeatureCallout";

export default function PreOrdersSection() {
  return (
    <LandingFeatureCallout
      eyebrow="Pro"
      title="Take pre-orders for collection day"
    >
      <p>
        Baking a batch, harvesting in the morning, or running a limited drop?
        Customers pre-order and pay by card to reserve - with an order-by
        deadline and a collection day - so you know how much to make before
        anyone arrives. Money goes to your Stripe account when they check out.
      </p>
      <p>
        Track who&apos;s coming in{" "}
        <strong className="font-semibold text-[var(--ink)]">Collections</strong>
        : mark Ready, then Collected. Optional exact slots on the stall (e.g.
        &ldquo;3 left&rdquo;). Buyer name and email come with the paid order;
        message them from Stallside when plans change.
      </p>
    </LandingFeatureCallout>
  );
}
