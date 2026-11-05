import ProUpgradeLink from "./ProUpgradeLink";
import { FEATURED_BENEFITS, PRO_GOLD_CTA } from "./why-pro-copy";

type Props = { socialReady: boolean; checkoutHref: string | null };

export default function ProFeaturedBenefits({ socialReady, checkoutHref }: Props) {
  return (
    <section aria-labelledby="pro-featured-heading" className="flex flex-col gap-4">
      <h2 id="pro-featured-heading" className="text-xl font-semibold">
        More Ways to Make, Sell and Grow
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_BENEFITS.map(({ title, body, icon: Icon, social }) => {
          const soon = social && !socialReady;
          return (
            <li key={title} className="dash-card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <Icon aria-hidden className="size-5 text-[var(--leaf)]" />
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    soon ? "border border-[var(--line)] text-[var(--muted)]" : "bg-[var(--marigold)]/25 text-[var(--field)]"
                  }`}
                >
                  {soon ? "COMING SOON" : "PRO"}
                </span>
              </div>
              <h3 className="font-semibold text-[var(--field)]">{title}</h3>
              <p className="text-sm text-[var(--muted)]">{body}</p>
            </li>
          );
        })}
      </ul>
      {checkoutHref ? (
        <ProUpgradeLink href={checkoutHref} placement="featured" className={`${PRO_GOLD_CTA} self-start`}>
          Upgrade to Pro
        </ProUpgradeLink>
      ) : null}
    </section>
  );
}
