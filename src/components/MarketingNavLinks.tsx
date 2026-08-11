import Link from "next/link";

const LINKS = [
  { href: "/stall", label: "Stall" },
  { href: "/pre-orders", label: "Pre-orders" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
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
