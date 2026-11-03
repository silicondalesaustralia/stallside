import Link from "next/link";
import { ListChecks } from "lucide-react";
import { HOME_BUTTON_GOLD, HOME_BUTTON_OUTLINE, HOME_EYEBROW, HOME_H3, HOME_HEADING_FONT } from "@/components/home/home-styles";

type HomePriceCardProps = {
  plan: string;
  title: string;
  price: string;
  summary: string;
  perks: readonly string[];
  fee: string;
  cta: string;
  featured?: boolean;
  onSeeAll: () => void;
};

export default function HomePriceCard({ plan, title, price, summary, perks, fee, cta, featured = false, onSeeAll }: HomePriceCardProps) {
  return (
    <article
      className={`flex flex-col border p-7 md:p-10 ${
        featured ? "border-[#b0bc9f] bg-[#edf0e6]" : "border-[var(--line)]"
      }`}
    >
      <p className={HOME_EYEBROW}>{plan}</p>
      <h3 className={`${HOME_H3} text-[28px] md:text-[30px]`}>{title}</h3>
      <div className="mb-4 mt-6 flex items-baseline gap-2 text-[var(--field)]">
        <strong className={`${HOME_HEADING_FONT} text-[48px] leading-none`}>{price}</strong>
        <span className="text-[13px]">/ month</span>
      </div>
      <p className="text-sm text-[var(--muted)]">{summary}</p>
      <ul className="my-6 text-sm text-[var(--field)]">
        {perks.map((perk) => (
          <li key={perk} className="py-2">
            <span aria-hidden className="mr-3 text-[var(--leaf)]">
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
        See all features
      </button>
      <p className="max-w-[390px] text-xs text-[var(--muted)] md:min-h-[60px]">{fee}</p>
      <Link href="/signup" className={`${featured ? HOME_BUTTON_GOLD : HOME_BUTTON_OUTLINE} mt-6`}>
        {cta} <span aria-hidden>↗</span>
      </Link>
    </article>
  );
}
