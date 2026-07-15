import { LANDING_FAQS } from "@/lib/landing-faqs";

export default function LandingFaq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="relative mb-4">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>
      <p className="mb-8 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
        Straight answers about Stallside for farm-stand and honesty-stall owners.
      </p>

      <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {LANDING_FAQS.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="cursor-pointer list-none font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--field)] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {faq.question}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-[var(--leaf)] transition group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <dd className="mt-3 max-w-3xl text-[var(--muted)]">{faq.answer}</dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
