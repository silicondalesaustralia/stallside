import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";

const LINKS = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export default function LpFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--panel)] px-5 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <BrandLockup link={false} size="sm" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
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
      </div>
    </footer>
  );
}
