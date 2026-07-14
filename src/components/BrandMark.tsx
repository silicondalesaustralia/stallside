type BrandMarkProps = {
  className?: string;
  variant?: "light" | "dark";
};

/** QR-finder bracket + seed - Stallside mark */
export default function BrandMark({ className = "size-10", variant = "light" }: BrandMarkProps) {
  const bracket = variant === "dark" ? "var(--ink-on-dark)" : "var(--field)";
  const seed = variant === "dark" ? "var(--marigold)" : "var(--leaf)";
  const stem = variant === "dark" ? "var(--field)" : "var(--wash)";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="4" y="4" width="40" height="40" rx="12" stroke={bracket} strokeWidth="5" />
      <path
        d="M24 14c6 4 8 9 8 13a8 8 0 1 1-16 0c0-4 2-9 8-13z"
        fill={seed}
      />
      <path d="M24 24v8" stroke={stem} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
