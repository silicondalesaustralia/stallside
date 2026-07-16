import BrandMark from "@/components/BrandMark";
import { APP_NAME } from "@/lib/constants";

/** Idle home screen inside the stall-owner phone demo. */
export default function DemoOwnerPhoneScreen() {
  return (
    <div className="flex h-full flex-col bg-[var(--wash)] px-4 pb-6 pt-2">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <BrandMark className="size-14" />
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--field)]">
          {APP_NAME}
        </p>
        <p className="max-w-[220px] text-sm leading-snug text-[var(--muted)]">
          Orders and sale alerts appear here — just like on the owner&apos;s real
          phone.
        </p>
      </div>
    </div>
  );
}
