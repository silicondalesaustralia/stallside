import LpUpsellOfferBadge from "@/components/lp/LpUpsellOfferBadge";

/** Hero collage for farm-stalls LPs - bread + eggs upsell. */
export default function FarmStallsHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white shadow-[0_18px_40px_-12px_rgb(23_54_31_/_0.45)]">
        <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
          <figure className="relative bg-[#2a3a2e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lp/rye-loaf.jpeg"
              alt="Fresh bread for farm stall pre-orders"
              width={678}
              height={452}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/3] h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6">
              <p className="text-xs font-semibold text-white">Fresh bread</p>
              <p className="text-[10px] text-white/80">Pre-order · Sat collect</p>
            </figcaption>
          </figure>
          <figure className="relative bg-[#2a3a2e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lp/dozen-eggs.jpeg"
              alt="Dozen eggs cart upsell"
              width={800}
              height={800}
              decoding="async"
              className="aspect-[4/3] h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6">
              <p className="text-xs font-semibold text-white">Dozen eggs</p>
              <p className="text-[10px] text-white/80">Cart add-on</p>
            </figcaption>
          </figure>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[var(--muted)]">Saturday collection</span>
            <span className="font-semibold tabular-nums text-[var(--field)]">
              A$540 taken
            </span>
          </div>
          <ul className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Bread", value: "18" },
              { label: "Boxes", value: "12" },
              { label: "Orders", value: "28" },
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
            title="Add a dozen eggs?"
            compareAt="A$8.00"
            price="A$6.50"
          />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Share the link · pack from the make list · eggs at checkout
      </p>
    </div>
  );
}
