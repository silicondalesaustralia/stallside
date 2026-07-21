import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";

const links = [
  { href: "/admin", label: "SaaS" },
  { href: "/admin/owners", label: "Subscribers" },
  { href: "/admin/invites", label: "Invites" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/stands", label: "Stands" },
  { href: "/admin/orders", label: "Orders" },
] as const;

export default function AdminNav() {
  return (
    <header className="bg-[var(--field)] text-[var(--ink-on-dark)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <BrandLockup href="/admin" variant="dark" size="sm" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--marigold)]">
            Admin
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--ink-on-dark)]/75 transition hover:text-[var(--ink-on-dark)]"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard" className="text-[var(--marigold)] underline">
            Owner dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
