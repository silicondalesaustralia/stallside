export default function MembershipCategoryIntro({
  eyebrow,
  heading,
  intro,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
}) {
  return (
    <header className="mb-7 sm:mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mc-label)] sm:text-xs">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[32px] font-medium leading-[1.12] tracking-tight sm:text-[38px]">
        {heading}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--mc-muted)]">
        {intro}
      </p>
    </header>
  );
}