import type { ReactNode } from "react";
import { preorderDetailBrandStyle } from "@/lib/membership-brand-style";

export default function PreOrderDetailShell({
  accentColor,
  children,
}: {
  accentColor?: string | null;
  children: ReactNode;
}) {
  return (
    <div
      style={preorderDetailBrandStyle(accentColor)}
      className="flex flex-col gap-6 text-[15px] leading-[1.55] text-[var(--field)] sm:gap-7"
    >
      {children}
    </div>
  );
}
