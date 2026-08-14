export type LandingHeroIconName =
  | "farm"
  | "baker"
  | "produce"
  | "anyone"
  | "cashCard"
  | "payments";

export function LandingHeroIcon({ name }: { name: LandingHeroIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-3.5",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "farm":
      return (
        <svg {...common}>
          <path d="M4 20V10l8-6 8 6v10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "baker":
      return (
        <svg {...common}>
          <path d="M8 14c0-3 1.5-5 4-5s4 2 4 5" />
          <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4Z" />
          <path d="M9 9c.5-1.5 1.5-2.5 3-2.5S14.5 7.5 15 9" />
        </svg>
      );
    case "produce":
      return (
        <svg {...common}>
          <path d="M12 21c4-3 6-6.5 6-10a6 6 0 1 0-12 0c0 3.5 2 7 6 10Z" />
          <path d="M12 11V5" />
        </svg>
      );
    case "anyone":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16" cy="9" r="2" />
          <path d="M4 19c1-3 3-4.5 5-4.5s4 1.5 5 4.5" />
          <path d="M13 19c.5-2 1.8-3.2 3.5-3.2 1.2 0 2.2.6 3 1.7" />
        </svg>
      );
    case "cashCard":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M3 11h18" />
          <path d="M7 15h4" />
        </svg>
      );
    case "payments":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10" />
          <path d="M9.5 9.5c.5-1 1.5-1.5 2.5-1.5 1.5 0 2.5.8 2.5 2s-1 2-2.5 2.5-2.5.8-2.5 2c0 1.2 1 2 2.5 2 1 0 2-.5 2.5-1.5" />
        </svg>
      );
  }
}

export function LandingHeroIconChip({
  label,
  icon,
}: {
  label: string;
  icon: LandingHeroIconName;
}) {
  return (
    <li className="inline-flex items-center gap-2">
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)] text-[var(--field)]"
        aria-hidden
      >
        <LandingHeroIcon name={icon} />
      </span>
      <span>{label}</span>
    </li>
  );
}
