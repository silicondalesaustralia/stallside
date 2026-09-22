import { parseTermsSections } from "@/lib/membership-terms";

const SECTION_STYLES = [
  {
    border: "border-[var(--leaf)]/25",
    bg: "bg-[var(--leaf)]/8",
    heading: "text-[var(--leaf-dark)]",
  },
  {
    border: "border-[var(--ok)]/30",
    bg: "bg-[var(--ok)]/10",
    heading: "text-[var(--ink)]",
  },
  {
    border: "border-[var(--warn)]/35",
    bg: "bg-[var(--warn)]/10",
    heading: "text-[var(--ink)]",
  },
  {
    border: "border-[var(--line)]",
    bg: "bg-[var(--panel)]",
    heading: "text-[var(--leaf-dark)]",
  },
  {
    border: "border-[var(--gone)]/25",
    bg: "bg-[var(--gone)]/8",
    heading: "text-[var(--ink)]",
  },
] as const;

export default function MembershipTermsCards({ text }: { text: string }) {
  const sections = parseTermsSections(text);
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, i) => {
        const style = SECTION_STYLES[i % SECTION_STYLES.length]!;
        return (
          <section
            key={`${section.heading}-${i}`}
            className={`rounded-xl border ${style.border} ${style.bg} px-4 py-3`}
          >
            <h2 className={`text-sm font-bold tracking-tight ${style.heading}`}>
              {section.heading}
            </h2>
            {section.body ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]/85">
                {section.body}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
