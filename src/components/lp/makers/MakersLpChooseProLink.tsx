"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useMakersLpCurrency } from "@/components/lp/makers/makers-lp-currency";
import { makersLpSignupHref } from "@/lib/makers-lp";

const noSubscription = () => () => {};

type Props = { placement: string; className?: string; children: ReactNode };

/** Signup with plan=pro and the selected currency, so new accounts continue to Pro checkout. */
export default function MakersLpChooseProLink({ placement, className, children }: Props) {
  const { currency } = useMakersLpCurrency();
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => "");
  return (
    <a
      href={makersLpSignupHref(search, { plan: "pro", currency })}
      suppressHydrationWarning
      data-lp-cta
      data-placement={placement}
      className={className}
    >
      {children}
    </a>
  );
}
