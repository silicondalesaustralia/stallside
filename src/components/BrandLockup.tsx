import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { APP_NAME } from "@/lib/constants";

export default function BrandLockup({
  href = "/",
  variant = "light",
  size = "md",
}: {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}) {
  const markClass = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9";
  const textClass =
    size === "lg"
      ? "text-3xl"
      : size === "sm"
        ? "text-lg"
        : "text-xl";
  const color = variant === "dark" ? "text-[var(--ink-on-dark)]" : "text-[var(--field)]";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] font-semibold tracking-[-0.02em] lowercase ${color} ${textClass}`}
    >
      <BrandMark className={markClass} variant={variant} />
      <span>{APP_NAME.toLowerCase()}</span>
    </Link>
  );
}
