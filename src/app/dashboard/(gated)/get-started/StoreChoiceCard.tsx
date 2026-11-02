import Link from "next/link";
import OnboardingStepIcon from "@/components/onboarding/OnboardingStepIcon";
import { WHY_PRO_PATH } from "@/components/dash-nav-links";

/** Free plan's website step: upgrade for a full website, or carry on with the free store link. */
export default function StoreChoiceCard({ number, standId }: { number: number; standId: string }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)]/10 text-[var(--leaf)]">
          <OnboardingStepIcon name="website" />
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--leaf)] text-[11px] font-semibold text-white">
            {number}
          </span>
        </span>
        <h2 className="font-semibold">Your online store</h2>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[var(--muted)]">
          <span className="font-semibold text-[var(--ink)]">Free:</span> share your vendl.app store link and QR code.
          Customers can browse, order and pay.
        </p>
        <p className="text-[var(--muted)]">
          <span className="font-semibold text-[var(--ink)]">Pro:</span> build your own website with your own address,
          pages, blog and ad tracking, and pay no Vendl fee on card sales.
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-3 text-sm">
        <Link
          href={WHY_PRO_PATH}
          className="rounded-full bg-[var(--marigold)] px-4 py-2 font-bold text-[var(--field)] hover:brightness-105"
        >
          Upgrade to Pro
        </Link>
        <Link href={`/dashboard/qr/business/${standId}`} className="font-semibold text-[var(--leaf-dark)] underline">
          Continue with Free
        </Link>
      </div>
    </li>
  );
}
