import Link from "next/link";
import type { StripeSetupBanner } from "@/lib/load-stripe-setup-banner";

export default function StripeSetupBanner({ banner }: { banner: StripeSetupBanner }) {
  const urgent = banner.mode === "restricted";

  return (
    <div
      className={`mb-4 rounded-[var(--radius-card)] border p-4 print:hidden ${
        urgent
          ? "border-amber-300 bg-amber-50"
          : "border-[var(--line)] bg-[var(--panel)]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
              urgent ? "text-amber-900" : "text-[var(--muted)]"
            }`}
          >
            {urgent ? "Action required" : "Optional setup"}
          </p>
          <h2
            className={`mt-1 font-[family-name:var(--font-display)] text-lg font-bold ${
              urgent ? "text-amber-950" : "text-[var(--ink)]"
            }`}
          >
            {banner.title}
          </h2>
          <p
            className={`mt-1 text-sm ${
              urgent ? "text-amber-950/85" : "text-[var(--muted)]"
            }`}
          >
            {banner.body}
          </p>
          <p
            className={`mt-3 text-sm font-semibold ${
              urgent ? "text-amber-950" : "text-[var(--ink)]"
            }`}
          >
            {banner.mode === "restricted" ? "Still needed:" : "Steps:"}
          </p>
          <ul
            className={`mt-1 list-inside list-disc text-sm ${
              urgent ? "text-amber-950/90" : "text-[var(--muted)]"
            }`}
          >
            {banner.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          {banner.helpHref ? (
            <Link
              href={banner.helpHref}
              className="mt-3 inline-block text-sm font-semibold text-[var(--leaf-dark)] underline"
            >
              Which is right for my business?
            </Link>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          {banner.ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="inline-flex justify-center rounded-full bg-[var(--marigold)] px-5 py-2.5 text-sm font-bold text-[var(--field)] shadow-[0_2px_12px_-4px_rgb(23_54_31_/_0.35)] transition hover:brightness-95"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
