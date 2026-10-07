import BrandLockup from "@/components/BrandLockup";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import {
  GOLD_CTA_COMPACT_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_SIGNUP_HREF,
} from "@/lib/home-producers-lp";

export default function CampaignHeader() {
  return (
    <header className="relative z-20 mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:h-[76px] sm:px-8">
      <BrandLockup link={false} size="sm" variant="dark" />
      <LpStartFreeLink
        placement="header"
        label={HOME_PRODUCERS_COPY.headerCtaLabel}
        href={HOME_PRODUCERS_SIGNUP_HREF}
        className={GOLD_CTA_COMPACT_CLASS}
      />
    </header>
  );
}
