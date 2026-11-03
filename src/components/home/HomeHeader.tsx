import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import OwnerAuthLink from "@/components/OwnerAuthLink";
import { HOME_BUTTON_SMALL } from "@/components/home/home-styles";

const NAV = [
  { href: "#platform", label: "The platform" },
  { href: "#makers", label: "Our makers" },
  { href: "#community", label: "Community" },
  { href: "#pricing", label: "Pricing" },
] as const;

export default function HomeHeader() {
  return (
    <header className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-[25px] lg:h-[100px] lg:px-12">
      <BrandLockup size="md" />
      <nav aria-label="Main navigation" className="hidden gap-4 text-xs font-semibold text-[var(--field)] md:flex lg:gap-7 lg:text-sm">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="hover:text-[var(--leaf)]">
            {item.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3 sm:gap-5">
        <span className="hidden md:inline-flex">
          <OwnerAuthLink variant="marketing" />
        </span>
        <Link href="/signup" className={HOME_BUTTON_SMALL}>
          Start free <span aria-hidden>↗</span>
        </Link>
      </div>
    </header>
  );
}
