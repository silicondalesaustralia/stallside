import { ShieldCheck } from "lucide-react";
import { HOME_H3, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

export default function MakersLpRiskReversal() {
  return (
    <section className={`${HOME_WRAP} py-12 md:py-16`}>
      <div className="grid gap-6 border border-[var(--line)] bg-white/60 p-7 md:grid-cols-[auto_1fr] md:gap-8 md:p-10">
        <ShieldCheck aria-hidden className="size-9 text-[var(--leaf)]" />
        <div>
          <h2 className={`${HOME_H3} mb-4 text-[28px] md:text-[34px]`}>Start Free. Upgrade When You&apos;re Ready.</h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-[var(--muted)] md:text-base">
            <p>Start with Vendl Free and move to Pro when you need more tools.</p>
            <p>
              You can cancel Pro anytime without a cancellation penalty. Your Pro features remain available until the
              end of your paid billing period.
            </p>
            <p>
              Subscription payments are generally non-refundable for unused time, subject to applicable consumer
              protection laws.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
