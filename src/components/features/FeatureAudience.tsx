import { HOME_EYEBROW, HOME_WRAP } from "@/components/home/home-styles";

export default function FeatureAudience({ labels }: { labels: string[] }) {
  if (!labels.length) return null;

  return (
    <section className={`${HOME_WRAP} border-t border-[var(--line)] py-10 md:py-12`}>
      <p className={`${HOME_EYEBROW} mb-3`}>BEST FOR</p>
      <ul className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <li
            key={label}
            className="rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-sm font-semibold text-[var(--field)]"
          >
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
