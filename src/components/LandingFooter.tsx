import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import FooterSellingFoodNav from "@/components/FooterSellingFoodNav";
import OwnerAuthLink from "@/components/OwnerAuthLink";
import {
  FOOTER_SOCIALS,
  FooterSocialIcon,
} from "@/components/footer-socials";
import { APP_DOMAIN, APP_NAME } from "@/lib/constants";

const linkClass =
  "text-sm text-[var(--ink-on-dark)]/75 transition hover:text-[var(--ink-on-dark)]";

const PRODUCT = [
  { href: "/demo", label: "Try Demo" },
  { href: "/stall", label: "Stall" },
  { href: "/pre-orders", label: "Pre-orders" },
  { href: "/#pricing", label: "Pricing" },
] as const;

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/farms-stand-news", label: "News" },
  { href: "/contact", label: "Contact" },
  { href: "/contact?subject=feature-request", label: "Feature request" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--ink-on-dark)]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function LinkList({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LandingFooter() {
  return (
    <footer className="bg-[var(--field)] px-6 py-10 text-[var(--ink-on-dark)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup variant="dark" href="/" />
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--ink-on-dark)]/70">{APP_DOMAIN}</p>
            {FOOTER_SOCIALS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${APP_NAME} on ${social.label}`}
                className="text-[var(--ink-on-dark)]/70 transition hover:text-[var(--ink-on-dark)]"
              >
                <FooterSocialIcon path={social.path} className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <FooterColumn title="Product">
            <LinkList items={PRODUCT} />
          </FooterColumn>
          <FooterColumn title="Company">
            <LinkList items={COMPANY} />
            <div className="mt-1.5">
              <OwnerAuthLink variant="footer" />
            </div>
          </FooterColumn>
          <FooterColumn title="Selling food in your region">
            <FooterSellingFoodNav />
          </FooterColumn>
          <FooterColumn title="Legal">
            <LinkList items={LEGAL} />
          </FooterColumn>
        </nav>
      </div>
    </footer>
  );
}
