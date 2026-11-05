import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { HOME_PLAN_TAG } from "@/components/lp/makers/makers-lp-styles";
import type { MakersLpPlanTag } from "@/lib/makers-lp-benefits";

type Props = { title: string; icon: LucideIcon; tag: MakersLpPlanTag; className?: string; children: ReactNode };

export default function MakersLpFeatureCard({ title, icon: Icon, tag, className = "", children }: Props) {
  const pro = tag === "PRO";
  return (
    <li className={`flex flex-col border p-5 ${pro ? "border-[#b0bc9f] bg-[#edf0e6]" : "border-[var(--line)] bg-white/50"} ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Icon aria-hidden className="size-5 text-[var(--leaf)]" />
        <span className={HOME_PLAN_TAG}>{pro ? "PRO" : "FREE & PRO"}</span>
      </div>
      <h4 className="mb-2 text-[17px] font-semibold leading-snug text-[var(--field)]">{title}</h4>
      <p className="text-[15px] leading-relaxed text-[var(--muted)]">{children}</p>
    </li>
  );
}
