import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import MarketingNav from "@/components/features/MarketingNav";
import OwnerAuthLink from "@/components/OwnerAuthLink";
import { HOME_BUTTON_SMALL } from "@/components/home/home-styles";

export default function HomeHeader() {
  return (
    <header className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-[25px] lg:h-[100px] lg:px-12">
      <BrandLockup size="md" />
      <MarketingNav variant="home" />
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
