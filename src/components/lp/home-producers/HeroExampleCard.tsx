import Image from "next/image";

const ITEMS = [
  { name: "Seasonal veggie box", src: "/lp/home-producers/card-vegetables.jpg" },
  { name: "Homemade jam", src: "/lp/home-producers/card-pantry.jpg" },
  { name: "Sourdough loaf", src: "/lp/home-producers/card-sourdough.jpg" },
  { name: "Rosemary focaccia", src: "/lp/home-producers/card-focaccia.jpg" },
] as const;

/** Illustrative only - not live stock or a real customer shop. */
export default function HeroExampleCard() {
  return (
    <figure className="w-[15.5rem] rounded-[20px] border border-white/60 bg-[var(--panel)]/95 p-4 text-[var(--ink)] shadow-xl backdrop-blur-sm sm:w-64">
      <figcaption className="text-xs font-medium text-[var(--muted)]">
        Example collection
      </figcaption>
      <p className="mt-0.5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
        Saturday pickup
      </p>
      <ul className="mt-3 space-y-2.5">
        {ITEMS.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            <Image
              src={item.src}
              alt=""
              width={40}
              height={40}
              sizes="40px"
              className="size-10 shrink-0 rounded-[10px] object-cover"
            />
            <span className="min-w-0 flex-1 text-sm font-semibold leading-tight">
              {item.name}
            </span>
            <span className="text-xs text-[var(--muted)]">× 1</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3 text-sm font-medium">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-[var(--marigold)]"
          fill="currentColor"
        >
          <path d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm10 7H4v7h12V9Z" />
        </svg>
        Collect Saturday, 9–11 am
      </p>
    </figure>
  );
}
