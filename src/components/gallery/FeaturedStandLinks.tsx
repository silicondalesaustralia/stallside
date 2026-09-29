import type { FeaturedStandLink } from "@/lib/featured-stands";

const PRIMARY =
  "inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]";
const SECONDARY =
  "inline-flex rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--leaf-dark)] hover:border-[var(--leaf)]";

export default function FeaturedStandLinks({ links }: { links: FeaturedStandLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="mt-7 flex flex-wrap gap-3">
      {links.map((link, i) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={i === 0 ? PRIMARY : SECONDARY}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
