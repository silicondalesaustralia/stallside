import type { ReactNode } from "react";
import { MAKERS_LP_SIGNUP_HREF } from "@/lib/makers-lp";

type Props = {
  placement: string;
  className?: string;
  children: ReactNode;
};

/** Plain anchor so LpCtaParamScript can merge ad params into the href before navigation. */
export default function MakersLpSignupLink({ placement, className, children }: Props) {
  return (
    <a
      href={MAKERS_LP_SIGNUP_HREF}
      suppressHydrationWarning
      data-lp-cta
      data-placement={placement}
      className={className}
    >
      {children}
    </a>
  );
}
