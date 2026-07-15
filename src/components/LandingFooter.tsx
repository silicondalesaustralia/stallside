import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import { APP_DOMAIN } from "@/lib/constants";

const LINKS = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Owner login" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export default function LandingFooter() {
  return (
    <footer className="bg-[var(--field)] px-6 py-10 text-[var(--ink-on-dark)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup variant="dark" href="/" />
          <p className="text-sm text-[var(--ink-on-dark)]/70">{APP_DOMAIN}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--ink-on-dark)]/75">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--ink-on-dark)]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
