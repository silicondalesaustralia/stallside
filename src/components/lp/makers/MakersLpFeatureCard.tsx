import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { HOME_H3, HOME_PLAN_TAG } from "@/components/lp/makers/makers-lp-styles";
import type { MakersLpPlanTag } from "@/lib/makers-lp-benefits";

type Props = { title: string; icon: LucideIcon; tag: MakersLpPlanTag; children: ReactNode };

export default function MakersLpFeatureCard({ title, icon: Icon, tag, children }: Props) {
  const pro = tag === "PRO";
  return (
    <li className={`flex flex-col border p-6 md:p-7 ${pro ? "border-[#b0bc9f] bg-[#edf0e6]" : "border-[var(--line)]"}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Icon aria-hidden className="size-6 text-[var(--leaf)]" />
        <span className={HOME_PLAN_TAG}>{tag}</span>
      </div>
      <h3 className={`${HOME_H3} mb-3 text-[22px]`}>{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--muted)]">{children}</p>
    </li>
  );
}
