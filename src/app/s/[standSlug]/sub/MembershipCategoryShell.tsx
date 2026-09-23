import type { ReactNode } from "react";
import { membershipCategoryBrandStyle } from "@/lib/membership-brand-style";

export default function MembershipCategoryShell({
  accentColor,
  children,
}: {
  accentColor?: string | null;
  children: ReactNode;
}) {
  return (
    <section
      style={membershipCategoryBrandStyle(accentColor)}
      className="w-full bg-[var(--mc-bg)] text-[var(--mc-ink)]"
    >
      <div className="membership-category mx-auto max-w-[960px] px-4 py-6 sm:px-6 sm:py-[30px]">
        {children}
      </div>
    </section>
  );
}
