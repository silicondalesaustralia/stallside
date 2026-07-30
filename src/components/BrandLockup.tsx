import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { APP_NAME } from "@/lib/constants";

export default function BrandLockup({
  href = "/",
  variant = "light",
  size = "md",
  link = true,
}: {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  link?: boolean;
}) {
  const markClass = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9";
  const textClass =
    size === "lg"
      ? "text-3xl"
      : size === "sm"
        ? "text-base sm:text-lg"
        : "text-xl";
  const color = variant === "dark" ? "text-[var(--ink-on-dark)]" : "text-[var(--field)]";
  const className = `inline-flex min-w-0 max-w-full items-center gap-2 font-[family-name:var(--font-display)] font-semibold tracking-[-0.02em] lowercase sm:gap-2.5 ${color} ${textClass}`;

  const inner = (
    <>
      <BrandMark className={`shrink-0 ${markClass}`} variant={variant} link={false} />
      <span className="truncate">{APP_NAME.toLowerCase()}</span>
    </>
  );

  if (!link) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
