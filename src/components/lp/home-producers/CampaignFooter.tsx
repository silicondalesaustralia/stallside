import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import { APP_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export default function CampaignFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--panel)] px-5 py-7 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4">
          <BrandLockup link={false} size="sm" />
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
        <nav aria-label="Legal" className="flex gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-sm text-[var(--muted)] underline-offset-2 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
