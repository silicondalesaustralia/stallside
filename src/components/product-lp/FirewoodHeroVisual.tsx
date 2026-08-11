import LpUpsellOfferBadge from "@/components/lp/LpUpsellOfferBadge";

/** Hero collage for firewood product / ads LPs - load + kindling upsell. */
export default function FirewoodHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white shadow-[0_18px_40px_-12px_rgb(23_54_31_/_0.45)]">
        <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
          <figure className="relative bg-[#2a3a2e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lp/firewood.jpeg"
              alt="Seasoned firewood ready for delivery"
              width={700}
              height={700}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/3] h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6">
              <p className="text-xs font-semibold text-white">Mixed hardwood</p>
              <p className="text-[10px] text-white/80">Deposit · deliver Sat</p>
            </figcaption>
          </figure>
          <figure className="relative bg-[#2a3a2e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lp/kindling.jpeg"
              alt="Bags of kindling for firewood upsell"
              width={768}
              height={1024}
              decoding="async"
              className="aspect-[4/3] h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6">
              <p className="text-xs font-semibold text-white">Kindling bags</p>
              <p className="text-[10px] text-white/80">Cart add-on</p>
            </figcaption>
          </figure>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[var(--muted)]">Saturday deliveries</span>
            <span className="font-semibold tabular-nums text-[var(--field)]">
              8 loads
            </span>
          </div>
          <ul className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Hardwood", value: "6" },
              { label: "Woodend", value: "5" },
              { label: "Kyneton", value: "3" },
            ].map((s) => (
              <li
                key={s.label}
                className="rounded-[var(--radius-sm)] bg-[var(--wash)] px-2 py-2"
              >
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                  {s.value}
                </p>
                <p className="text-[10px] font-medium text-[var(--muted)]">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
          <LpUpsellOfferBadge
            title="Add a bag of kindling?"
            compareAt="A$25"
            price="A$18"
          />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Deposit on the load · kindling at checkout · deliver what sold
      </p>
    </div>
  );
}
