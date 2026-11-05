import ProUpgradeLink from "./ProUpgradeLink";
import { PRO_GOLD_CTA, type ProCard } from "./why-pro-copy";

type Props = { cards: ProCard[]; monthlyPrice: string; checkoutHref: string };

export default function ProUpgradeHero({ cards, monthlyPrice, checkoutHref }: Props) {
  return (
    <section aria-labelledby="pro-hero-heading" className="rounded-2xl bg-[var(--field)] p-6 text-[var(--ink-on-dark)] md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--marigold)]">Vendl Pro</p>
      <h1 id="pro-hero-heading" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
        Make More of What You Sell.
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed opacity-90">
        Know what your products cost, create content to promote them, and keep more of every eligible card sale,
        with Vendl Pro.
      </p>
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {cards.map(({ title, body, icon: Icon }) => (
          <li key={title} className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
            <Icon aria-hidden className="size-5 text-[var(--marigold)]" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed opacity-85">{body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <ProUpgradeLink href={checkoutHref} placement="hero" className={PRO_GOLD_CTA}>
          Upgrade to Pro
        </ProUpgradeLink>
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {monthlyPrice}
            <span className="text-sm font-semibold opacity-80"> / month</span>
          </p>
          <p className="text-sm opacity-85">Cancel anytime · Provider processing fees still apply</p>
        </div>
      </div>
    </section>
  );
}
