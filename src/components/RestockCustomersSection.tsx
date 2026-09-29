import LandingFeatureCallout from "@/components/LandingFeatureCallout";

export default function RestockCustomersSection() {
  return (
    <LandingFeatureCallout
      eyebrow="Free"
      title="Tell regulars you're back in stock"
    >
      <p>
        Many times your stand will have regular customers - the same faces who
        know when eggs, flowers, or firewood tend to appear. When you&apos;re
        sold out, they leave empty-handed and may not swing by again for days.
      </p>
      <p>
        After they pay they can tap once to get an email when that stand
        restocks - nothing else. You restock, open{" "}
        <strong className="font-semibold text-[var(--ink)]">Communication</strong>
        , tap <strong className="font-semibold text-[var(--ink)]">Broadcast</strong>{" "}
        on your Restock alerts list, and they hear you&apos;re back. You never
        see their addresses; Vendl sends on your behalf.
      </p>
    </LandingFeatureCallout>
  );
}
