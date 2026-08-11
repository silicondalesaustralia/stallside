import BakersHeroVisual from "@/components/product-lp/BakersHeroVisual";
import FarmStallsHeroVisual from "@/components/product-lp/FarmStallsHeroVisual";
import FirewoodHeroVisual from "@/components/product-lp/FirewoodHeroVisual";
import LpHeroVisual from "@/components/lp/LpHeroVisual";
import LpUpsellOfferBadge from "@/components/lp/LpUpsellOfferBadge";

type Props = {
  variant:
    | "stall"
    | "makeList"
    | "delivery"
    | "bakers"
    | "firewood"
    | "farmStalls";
};

function MakeListPanel({ variant }: { variant: "makeList" | "delivery" }) {
  const title =
    variant === "delivery" ? "Saturday deliveries" : "Friday bake - make";
  const caption =
    variant === "delivery"
      ? "Deposits taken · balances clear before the ute leaves"
      : "Window closed · totals ready before you mix";
  const rows =
    variant === "delivery"
      ? [
          { label: "Mixed hardwood 1m³", value: "6" },
          { label: "Redgum 1m³", value: "2" },
          { label: "Woodend", value: "5 stops" },
          { label: "Kyneton", value: "3 stops" },
        ]
      : [
          { label: "Sourdough", value: "40" },
          { label: "Rye", value: "12" },
          { label: "Focaccia", value: "8" },
          { label: "Taken", value: "A$612" },
        ];
  const upsell =
    variant === "delivery"
      ? { title: "Add kindling?", compareAt: "A$25", price: "A$18" }
      : { title: "Add jam jar?", compareAt: "A$8.00", price: "A$5.50" };

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-[0_18px_40px_-12px_rgb(23_54_31_/_0.45)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Make list
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          {title}
        </p>
        <ul className="mt-5 space-y-3">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] pb-2 text-sm"
            >
              <span className="text-[var(--muted)]">{r.label}</span>
              <span className="font-semibold tabular-nums text-[var(--field)]">
                {r.value}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--wash)] px-3 py-2 text-xs font-medium text-[var(--leaf-dark)]">
          {caption}
        </p>
        <div className="mt-4 border-t border-dashed border-[var(--line)] pt-4">
          <LpUpsellOfferBadge
            title={upsell.title}
            compareAt={upsell.compareAt}
            price={upsell.price}
          />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Share the link · orders come in · open this before you start
      </p>
    </div>
  );
}

export default function ProductLpHeroVisual({ variant }: Props) {
  if (variant === "stall") return <LpHeroVisual />;
  if (variant === "bakers") return <BakersHeroVisual />;
  if (variant === "firewood") return <FirewoodHeroVisual />;
  if (variant === "farmStalls") return <FarmStallsHeroVisual />;
  return <MakeListPanel variant={variant} />;
}
