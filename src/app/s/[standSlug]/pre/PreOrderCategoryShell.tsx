import type { ReactNode } from "react";
import { preorderCategoryBrandStyle } from "@/lib/membership-brand-style";

export default function PreOrderCategoryShell({
  accentColor,
  children,
}: {
  accentColor?: string | null;
  children: ReactNode;
}) {
  return (
    <section
      style={preorderCategoryBrandStyle(accentColor)}
      className="w-full text-[var(--field)]"
    >
      <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-6 sm:py-[30px]">
        {children}
      </div>
    </section>
  );
}
