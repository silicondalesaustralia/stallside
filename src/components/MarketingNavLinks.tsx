import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export default function MarketingNavLinks({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const linkClass =
    variant === "dark"
      ? "text-sm font-medium text-[var(--ink-on-dark)]/80 transition hover:text-[var(--ink-on-dark)]"
      : "text-sm font-medium text-[var(--muted)] transition hover:text-[var(--ink)]";

  return (
    <nav
      className="hidden items-center gap-4 md:flex"
      aria-label="Marketing"
    >
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
