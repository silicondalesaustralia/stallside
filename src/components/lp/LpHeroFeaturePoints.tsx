export type LpHeroFeatureIcon = "upsell" | "subscription";

export type LpHeroFeaturePoint = {
  icon: LpHeroFeatureIcon;
  label: string;
  detail: string;
};

/** Shown on every marketing / LP hero unless a page overrides. */
export const DEFAULT_HERO_FEATURE_POINTS: LpHeroFeaturePoint[] = [
  {
    icon: "upsell",
    label: "Cart upsells that grow the basket",
    detail:
      "Offer one more item at checkout - grow the average order without another app.",
  },
  {
    icon: "subscription",
    label: "Subscriptions for recurring boxes",
    detail:
      "Weekly, fortnightly, or monthly boxes - predictable revenue without chasing DMs.",
  },
];

function FeatureIcon({ icon }: { icon: LpHeroFeatureIcon }) {
  if (icon === "subscription") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 8h16" />
        <path d="M4 16h16" />
        <path d="M8 4v4" />
        <path d="M16 4v4" />
        <path d="M8 16v4" />
        <path d="M16 16v4" />
        <rect x="6" y="8" width="12" height="8" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v18" />
      <path d="M7 8h7a3 3 0 0 1 0 6H9" />
      <path d="M9 14h6a3 3 0 0 1 0 6H7" />
    </svg>
  );
}

/** Icon + short label/detail rows under LP hero headlines. */
export default function LpHeroFeaturePoints({
  points,
}: {
  points: LpHeroFeaturePoint[];
}) {
  if (!points.length) return null;

  return (
    <ul className="mt-4 flex max-w-xl flex-col gap-2.5">
      {points.map((point) => (
        <li
          key={point.label}
          className="flex items-start gap-3 rounded-xl border border-[var(--leaf)]/30 bg-[linear-gradient(135deg,rgb(46_125_63_/_0.1),rgb(244_197_66_/_0.08))] px-3.5 py-3"
        >
          <span
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)] text-[var(--field)] shadow-sm"
            aria-hidden
          >
            <FeatureIcon icon={point.icon} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--field)]">
              {point.label}
            </p>
            <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
              {point.detail}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
