import type { ReactNode } from "react";
import { ListChecks } from "lucide-react";
import { HOME_EYEBROW, HOME_H3, HOME_HEADING_FONT } from "@/components/lp/makers/makers-lp-styles";

type MakersLpPriceCardProps = {
  plan: string;
  title: string;
  price: string;
  period?: "month" | "year";
  priceNote?: string;
  perks: readonly string[];
  fee: string;
  seeAllLabel: string;
  action: ReactNode;
  featured?: boolean;
  onSeeAll: () => void;
};

export default function MakersLpPriceCard({
  plan,
  title,
  price,
  period = "month",
  priceNote,
  perks,
  fee,
  seeAllLabel,
  action,
  featured = false,
  onSeeAll,
}: MakersLpPriceCardProps) {
  return (
    <article
      className={`flex flex-col border p-7 md:p-10 ${
        featured ? "border-[#b0bc9f] bg-[#edf0e6]" : "border-[var(--line)]"
      }`}
    >
      <p className={HOME_EYEBROW}>{plan}</p>
      <h3 className={`${HOME_H3} text-[28px] md:text-[30px]`}>{title}</h3>
      <div className="mb-2 mt-6 flex items-baseline gap-2 text-[var(--field)]">
        <strong className={`${HOME_HEADING_FONT} text-[44px] leading-none md:text-[48px]`}>{price}</strong>
        <span className="text-[13px]">/ {period}</span>
      </div>
      {priceNote ? <p className="text-sm font-medium text-[var(--leaf)]">{priceNote}</p> : null}
      <ul className="my-6 text-sm text-[var(--field)]">
        {perks.map((perk) => (
          <li key={perk} className="flex gap-3 py-2">
            <span aria-hidden className="text-[var(--leaf)]">
              ✓
            </span>
            {perk}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSeeAll}
        className="-mt-2 mb-6 inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--field)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--field)]"
      >
        <ListChecks aria-hidden className="size-4 text-[var(--leaf)]" />
        {seeAllLabel}
      </button>
      <p className="max-w-[420px] text-sm text-[var(--muted)] md:min-h-[60px]">{fee}</p>
      <div className="mt-6">{action}</div>
    </article>
  );
}
