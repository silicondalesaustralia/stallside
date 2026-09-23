import type { ReactNode } from "react";
import { membershipContentBrandStyle } from "@/lib/membership-brand-style";

export default function MembershipContentShell({
  accentColor,
  children,
}: {
  accentColor?: string | null;
  children: ReactNode;
}) {
  return (
    <div
      style={membershipContentBrandStyle(accentColor)}
      className="flex flex-col gap-6 bg-[var(--m-bg)] text-[15px] leading-[1.55] text-[var(--m-ink)] sm:gap-7"
    >
      {children}
    </div>
  );
}
