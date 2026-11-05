import { HOME_H3, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { HOME_FAQS } from "@/lib/makers-lp-faqs";

export default function MakersLpFaq() {
  return (
    <section id="faq" className={`${HOME_WRAP} scroll-mt-6 grid gap-6 border-t border-[var(--line)] py-12 md:grid-cols-[1fr_1.2fr] md:gap-16 md:pb-20 md:pt-[70px]`}>
      <h2 className={`${HOME_H3} text-[32px] md:text-[36px]`}>
        A few things
        <br />
        you might be wondering.
      </h2>
      <div>
        {HOME_FAQS.map((faq) => (
          <details key={faq.question} className="group border-b border-[var(--line)] py-[18px]">
            <summary className="flex cursor-pointer list-none rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--leaf)] items-center justify-between gap-4 text-[15px] font-semibold text-[var(--field)] [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span aria-hidden className="text-lg transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-sm text-[var(--muted)]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
