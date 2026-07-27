import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

type BrandMarkProps = {
  className?: string;
  variant?: "light" | "dark";
  /** When false, render mark only (print sheets, nested lockups, mockups). */
  link?: boolean;
};

/** QR-finder bracket + seed - Stallside mark. Links home by default. */
export default function BrandMark({
  className = "size-10",
  variant = "light",
  link = true,
}: BrandMarkProps) {
  const bracket = variant === "dark" ? "var(--ink-on-dark)" : "var(--field)";
  const seed = variant === "dark" ? "var(--marigold)" : "var(--leaf)";
  const stem = variant === "dark" ? "var(--field)" : "var(--wash)";

  const mark = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={link ? undefined : true}
    >
      <rect x="4" y="4" width="40" height="40" rx="12" stroke={bracket} strokeWidth="5" />
      <path
        d="M24 14c6 4 8 9 8 13a8 8 0 1 1-16 0c0-4 2-9 8-13z"
        fill={seed}
      />
      <path d="M24 24v8" stroke={stem} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (!link) return mark;

  return (
    <Link
      href="/"
      className="inline-flex shrink-0"
      aria-label={`${APP_NAME} home`}
    >
      {mark}
    </Link>
  );
}
