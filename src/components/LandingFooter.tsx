import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import OwnerAuthLink from "@/components/OwnerAuthLink";
import { APP_DOMAIN } from "@/lib/constants";

const LINKS = [
  { href: "/demo", label: "Try Demo" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/contact?subject=feature-request", label: "Feature request" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

const YOUTUBE_URL = "https://www.youtube.com/@Stallside";

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function LandingFooter() {
  return (
    <footer className="bg-[var(--field)] px-6 py-10 text-[var(--ink-on-dark)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup variant="dark" href="/" />
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--ink-on-dark)]/70">{APP_DOMAIN}</p>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Stallside on YouTube"
              className="text-[var(--ink-on-dark)]/70 transition hover:text-[var(--ink-on-dark)]"
            >
              <YouTubeIcon className="size-5" />
            </a>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--ink-on-dark)]/75">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--ink-on-dark)]">
              {link.label}
            </Link>
          ))}
          <OwnerAuthLink variant="footer" />
        </nav>
      </div>
    </footer>
  );
}
