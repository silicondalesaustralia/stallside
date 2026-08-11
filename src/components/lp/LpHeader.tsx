import BrandLockup from "@/components/BrandLockup";
import LpHeaderShell from "@/components/lp/LpHeaderShell";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

type Props = {
  brandLink?: boolean;
  ctaLabel?: string;
  signupHref?: string;
  aside?: string;
};

export default function LpHeader({
  brandLink = false,
  ctaLabel,
  signupHref,
  aside = "A$0 monthly on Free",
}: Props) {
  return (
    <LpHeaderShell>
      <BrandLockup link={brandLink} size="sm" />
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-[var(--muted)] sm:block">{aside}</p>
        <LpStartFreeLink
          placement="header"
          {...(ctaLabel ? { label: ctaLabel } : {})}
          href={signupHref}
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)] sm:px-5"
        />
      </div>
    </LpHeaderShell>
  );
}
