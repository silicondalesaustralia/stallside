import BrandLockup from "@/components/BrandLockup";
import LpHeaderShell from "@/components/lp/LpHeaderShell";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

export default function LpHeader() {
  return (
    <LpHeaderShell>
      <BrandLockup link={false} size="sm" />
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-[var(--muted)] sm:block">
          A$0 monthly on Free
        </p>
        <LpStartFreeLink
          placement="header"
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)] sm:px-5"
        />
      </div>
    </LpHeaderShell>
  );
}
