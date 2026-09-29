import type { Testimonial } from "@/lib/testimonials";

const TONES = [
  "bg-[var(--field)] text-[var(--ink-on-dark)]",
  "bg-[var(--marigold)]/15 text-[var(--ink)] ring-1 ring-[var(--marigold)]/30",
  "bg-[var(--panel)] text-[var(--ink)] ring-1 ring-[var(--line)]",
] as const;

export default function TestimonialTile({
  item,
  index,
}: {
  item: Testimonial;
  index: number;
}) {
  const tone = TONES[index % TONES.length];
  const dark = index % TONES.length === 0;

  return (
    <blockquote className={`relative rounded-[var(--radius)] p-6 sm:p-7 ${tone}`}>
      <span
        aria-hidden
        className={`block font-[family-name:var(--font-display)] text-6xl leading-none ${dark ? "text-[var(--marigold)]" : "text-[var(--leaf)]"}`}
      >
        &ldquo;
      </span>
      <div className="-mt-3 space-y-3 text-base leading-relaxed">
        {item.quote.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <footer className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold">
        {item.name}
        <span
          className={`mt-0.5 block text-sm font-normal ${dark ? "text-[var(--ink-on-dark)]/70" : "text-[var(--muted)]"}`}
        >
          {item.location}
        </span>
      </footer>
    </blockquote>
  );
}
