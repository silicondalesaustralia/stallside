import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

type Props = {
  headline?: string;
  support?: string;
  note?: string;
  ctaLabel?: string;
  signupHref?: string;
};

export default function LpClosingCta({
  headline = "Your stall, minus the missed sales.",
  support = "Set up your QR checkout in minutes and give every customer a way to pay.",
  note = "A$0 monthly on Free · No terminal · No card details",
  ctaLabel,
  signupHref,
}: Props) {
  return (
    <section
      id="lp-final-cta"
      className="bg-[var(--field)] px-5 py-14 text-center text-[var(--ink-on-dark)] sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
          {headline}
        </h2>
        <p className="mt-3 text-base text-[var(--ink-on-dark)]/85 sm:text-lg">
          {support}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <LpStartFreeLink
            placement="final"
            label={ctaLabel}
            href={signupHref}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--marigold)] px-6 py-3 text-base font-semibold text-[var(--field)] transition hover:brightness-105"
          />
          <p className="text-sm text-[var(--ink-on-dark)]/70">{note}</p>
        </div>
      </div>
    </section>
  );
}
