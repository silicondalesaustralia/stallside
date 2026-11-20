import HomePaymentTile from "@/components/home/HomePaymentTile";
import { HOME_EYEBROW, HOME_WRAP } from "@/components/home/home-styles";
import { HOME_IMPORT_SOURCES } from "@/lib/home-page-copy";
import { HOME_PAYMENT_METHODS, HOME_PAYMENT_PROVIDERS } from "@/lib/home-payments";
import type { FeatureLogoStrip as StripKind } from "@/lib/features/visuals";

export default function FeatureLogoStrip({ kind }: { kind: StripKind }) {
  if (!kind) return null;

  if (kind === "platforms") {
    return (
      <section className={`${HOME_WRAP} border-t border-[var(--line)] py-12 md:py-16`}>
        <p className={HOME_EYEBROW}>IMPORT FROM</p>
        <ul className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
          {HOME_IMPORT_SOURCES.map((source) => (
            <li key={source.name} className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={source.icon} alt="" className="h-5 w-5 object-contain" />
              <span className="text-xs font-semibold text-[var(--field)]">{source.name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted)]">Pro · map columns and review your catalogue as you move over.</p>
      </section>
    );
  }

  return (
    <section className={`${HOME_WRAP} border-t border-[var(--line)] py-12 md:py-16`}>
      <p className={HOME_EYEBROW}>GET PAID WITH</p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {HOME_PAYMENT_PROVIDERS.map((mark) => (
          <HomePaymentTile key={mark.label} mark={mark} large />
        ))}
      </ul>
      <ul className="mt-5 flex flex-wrap gap-3">
        {HOME_PAYMENT_METHODS.map((mark) => (
          <HomePaymentTile key={mark.label} mark={mark} />
        ))}
      </ul>
    </section>
  );
}
