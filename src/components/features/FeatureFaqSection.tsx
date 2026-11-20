import { HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/home/home-styles";
import type { FeatureFaq } from "@/lib/features/types";

export default function FeatureFaqSection({ faqs }: { faqs: FeatureFaq[] }) {
  if (!faqs.length) return null;

  return (
    <section className={`${HOME_WRAP} border-t border-[var(--line)] py-16 md:py-[88px]`}>
      <p className={HOME_EYEBROW}>QUESTIONS</p>
      <h2 className={`${HOME_H2} mb-8`}>A few things people ask.</h2>
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {faqs.map((faq) => (
          <details key={faq.q} className="group py-5">
            <summary className="cursor-pointer list-none font-semibold text-[var(--field)]">
              <span className="flex items-center justify-between gap-4">
                {faq.q}
                <span
                  aria-hidden
                  className="text-lg text-[var(--muted)] transition group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-[var(--muted)]">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
