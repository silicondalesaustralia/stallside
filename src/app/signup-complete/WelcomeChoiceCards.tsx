"use client";

import { useEffect, useRef } from "react";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";
import { chooseWelcome } from "./actions";

type Props = { proFirst: boolean; currency: string | null; interval: string | null };

const PRIMARY =
  "inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--leaf)]";
const SECONDARY =
  "inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[var(--field)] transition hover:border-[var(--field)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--leaf)]";

/** Free first and primary; "Choose Pro" signups (proFirst) get Pro as the primary card instead. */
export default function WelcomeChoiceCards({ proFirst, currency, interval }: Props) {
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackProUpgrade("welcome_offer_viewed", { intent: proFirst ? "pro" : "free" });
  }, [proFirst]);

  const free = (
    <form key="free" action={chooseWelcome} className="dash-card flex flex-col gap-3 p-5">
      <input type="hidden" name="choice" value="free" />
      <h2 className="text-lg font-semibold text-[var(--field)]">Continue with Vendl Free</h2>
      <p className="text-sm text-[var(--muted)]">
        Set up your products, shop, stock and orders. No monthly subscription.
      </p>
      <button
        type="submit"
        className={proFirst ? SECONDARY : PRIMARY}
        onClick={() => trackProUpgrade("welcome_free_selected")}
      >
        Continue with Free
      </button>
    </form>
  );

  const pro = (
    <form key="pro" action={chooseWelcome} className="dash-card flex flex-col gap-3 p-5">
      <input type="hidden" name="choice" value="pro" />
      {proFirst ? <input type="hidden" name="direct" value="1" /> : null}
      {proFirst && currency ? <input type="hidden" name="currency" value={currency} /> : null}
      {proFirst && interval ? <input type="hidden" name="interval" value={interval} /> : null}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--field)]">Explore Vendl Pro</h2>
        <span className="rounded-full bg-[var(--marigold)]/25 px-2 py-0.5 text-xs font-bold text-[var(--field)]">
          More tools
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">
        Unlock production costing, pricing tools, social marketing and no Vendl fee on eligible payments.
      </p>
      <button
        type="submit"
        className={proFirst ? PRIMARY : SECONDARY}
        onClick={() => trackProUpgrade("welcome_pro_selected")}
      >
        {proFirst ? "Continue to Vendl Pro" : "See Pro plans"}
      </button>
    </form>
  );

  return <div className="flex flex-col gap-4">{proFirst ? [pro, free] : [free, pro]}</div>;
}
