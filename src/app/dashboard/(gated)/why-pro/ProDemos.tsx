import ProDemoCosting from "./ProDemoCosting";
import ProDemoSocial from "./ProDemoSocial";
import ProFeeCalculator from "./ProFeeCalculator";
import ProUpgradeLink from "./ProUpgradeLink";
import ContinueWithFreeLink from "./ContinueWithFreeLink";
import { PRO_GOLD_CTA } from "./why-pro-copy";

type Props = {
  currency: string;
  feeBps: number;
  monthlyCents: number;
  annualCents: number | null;
  socialReady: boolean;
  checkoutHref: string;
};

export default function ProDemos({ currency, feeBps, monthlyCents, annualCents, socialReady, checkoutHref }: Props) {
  return (
    <section id="pro-demos" aria-labelledby="pro-demos-heading" className="flex scroll-mt-6 flex-col gap-4">
      <div>
        <h2 id="pro-demos-heading" className="text-xl font-semibold">
          See What You Can Do with Pro
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          From working out your product costs to creating promotional content and reducing Vendl transaction fees,
          here&apos;s what Pro adds to your business.
        </p>
      </div>
      <ProDemoCosting currency={currency} />
      <ProDemoSocial socialReady={socialReady} />
      <ProFeeCalculator currency={currency} feeBps={feeBps} monthlyCents={monthlyCents} annualCents={annualCents} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <ProUpgradeLink href={checkoutHref} placement="demos" className={PRO_GOLD_CTA}>
          Upgrade to Pro
        </ProUpgradeLink>
        <ContinueWithFreeLink placement="demos" />
      </div>
    </section>
  );
}
