import Link from "next/link";

const LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export default function LpFooter() {
  return (
    <footer className="border-t border-[var(--line)] px-5 py-8 sm:px-6">
      <nav
        aria-label="Legal"
        className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2"
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs text-[var(--muted)] underline-offset-2 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
