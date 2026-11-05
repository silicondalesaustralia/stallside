import { dashCtaClass } from "@/components/DashPrimaryCta";
import { DFY_BUILD_FREE_NOTE } from "@/lib/website/dfy-build";
import { buyDfyBuild } from "./actions";

type Props = { price: string; isPro: boolean };

export default function DfyBuildForm({ price, isPro }: Props) {
  return (
    <form action={buyDfyBuild} className="dash-card flex flex-col gap-4 p-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Your domain (optional)</span>
        <input
          name="domain"
          placeholder="www.yourbusiness.com"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <span className="text-xs text-[var(--muted)]">
          Already own a domain? Add it and we&apos;ll connect it. Leave blank if you don&apos;t have one yet.
        </span>
      </label>
      {isPro ? null : <p className="text-sm text-[var(--muted)]">{DFY_BUILD_FREE_NOTE}</p>}
      <button type="submit" className={`${dashCtaClass} self-start`}>
        Book My Website Build · {price}
      </button>
      <p className="text-xs text-[var(--muted)]">
        One-off payment, charged securely by Stripe. We&apos;ll email you what we need within 2 business days.
      </p>
    </form>
  );
}
