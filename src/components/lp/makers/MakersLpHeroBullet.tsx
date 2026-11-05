import type { ReactNode } from "react";
import { Check } from "lucide-react";

type Props = { lead: ReactNode; rest: ReactNode; sep?: string };

export default function MakersLpHeroBullet({ lead, rest, sep = " " }: Props) {
  return (
    <li className="flex items-start gap-3">
      <Check aria-hidden className="mt-1 size-[18px] shrink-0 text-[var(--leaf)]" />
      <span>
        <strong className="font-semibold text-[var(--field)]">{lead}</strong>
        {sep}
        {rest}
      </span>
    </li>
  );
}
