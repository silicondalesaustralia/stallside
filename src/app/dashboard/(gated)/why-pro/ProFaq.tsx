import { PRO_FAQ } from "./free-includes";

export default function ProFaq() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Questions</h2>
      <div className="dash-card divide-y divide-[var(--line)]">
        {PRO_FAQ.map((item) => (
          <details key={item.q} className="group px-5 py-3">
            <summary className="cursor-pointer list-none font-medium text-[var(--field)]">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
