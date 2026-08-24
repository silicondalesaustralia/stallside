import type { FaqItem } from "@/lib/schema";

export default function JurisdictionFaq({ faqs }: { faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;

  return (
    <section
      id="faq"
      className="mt-14 border-t border-[var(--line)] pt-10"
      aria-labelledby="jurisdiction-faq-heading"
    >
      <h2
        id="jurisdiction-faq-heading"
        className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]"
      >
        Frequently asked questions
      </h2>
      <dl className="mt-6 space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
              {faq.question}
            </dt>
            <dd className="mt-2 text-base leading-relaxed text-[var(--field)]">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
