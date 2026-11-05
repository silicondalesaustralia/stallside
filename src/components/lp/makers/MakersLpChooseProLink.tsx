"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useMakersLpCurrency } from "@/components/lp/makers/makers-lp-currency";
import { makersLpSignupHref } from "@/lib/makers-lp";

const noSubscription = () => () => {};

type Props = { placement: string; className?: string; yearly?: boolean; children: ReactNode };

/** Signup with plan=pro and the selected currency, so new accounts continue to Pro checkout. */
export default function MakersLpChooseProLink({ placement, className, yearly = false, children }: Props) {
  const { currency } = useMakersLpCurrency();
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => "");
  const extra: Record<string, string> = yearly ? { plan: "pro", currency, interval: "year" } : { plan: "pro", currency };
  return (
    <a
      href={makersLpSignupHref(search, extra)}
      suppressHydrationWarning
      data-lp-cta
      data-placement={placement}
      className={className}
    >
      {children}
    </a>
  );
}
