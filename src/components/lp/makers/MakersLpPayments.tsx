import MakersLpPaymentTile from "@/components/lp/makers/MakersLpPaymentTile";
import { HOME_EYEBROW, HOME_H2, HOME_PLAN_TAG, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { HOME_PAYMENT_METHODS, HOME_PAYMENT_PROVIDERS } from "@/lib/makers-lp-payments";

const SUBHEAD = "mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]";

export default function MakersLpPayments() {
  return (
    <section id="payments" className="scroll-mt-6 border-y border-[var(--line)] bg-[#f3f1ea] py-14 md:py-20">
      <div className={HOME_WRAP}>
        <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end md:gap-20">
          <div>
            <p className={HOME_EYEBROW}>GET PAID YOUR WAY</p>
            <span className={HOME_PLAN_TAG}>FREE &amp; PRO</span>
            <h2 className={`${HOME_H2} mt-4`}>
              Every way your
              <br />
              customers want to pay.
            </h2>
          </div>
          <p className="text-base text-[var(--muted)]">
            Connect Stripe or Square for cards, Tap &amp; Go and wallets, add PayPal with Pro, and take PayID, bank
            transfers and cash with no Vendl fee. Money goes straight to your own account.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div>
            <p className={SUBHEAD}>Connect your provider</p>
            <ul className="flex flex-wrap gap-4">
              {HOME_PAYMENT_PROVIDERS.map((mark) => (
                <MakersLpPaymentTile key={mark.label} mark={mark} large />
              ))}
            </ul>
          </div>
          <div>
            <p className={SUBHEAD}>Customers pay with</p>
            <ul className="flex flex-wrap gap-3">
              {HOME_PAYMENT_METHODS.map((mark) => (
                <MakersLpPaymentTile key={mark.label} mark={mark} />
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 max-w-[640px] text-xs text-[var(--muted)]">
          Available methods depend on your country and provider. Card, Tap &amp; Go and pay-later sales carry a 2.5% Vendl
          fee on Free and none on Pro. Stripe, Square and PayPal processing fees apply separately.
        </p>
      </div>
    </section>
  );
}
