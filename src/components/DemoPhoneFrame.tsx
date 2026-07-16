import type { ReactNode } from "react";

/** iPhone-style chrome for desktop demo checkout. */
export default function DemoPhoneFrame({
  children,
  notification,
}: {
  children: ReactNode;
  notification?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative rounded-[2.4rem] border-[10px] border-[var(--field)] bg-[var(--field)] shadow-[0_24px_60px_rgb(0_0_0/0.28)]">
        {/* Dynamic Island */}
        <div
          aria-hidden
          className="absolute left-1/2 top-2.5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black"
        />
        <div className="relative overflow-hidden rounded-[1.85rem] bg-[var(--wash)]">
          {/* Status bar */}
          <div
            aria-hidden
            className="relative z-10 flex items-center justify-between px-5 pb-1 pt-3 text-[10px] font-semibold text-[var(--ink)]"
          >
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm border border-current" />
              <span className="inline-block h-2.5 w-4 rounded-sm border border-current" />
            </span>
          </div>

          {notification}

          <div className="relative h-[560px] overflow-hidden bg-[var(--wash)]">
            {children}
          </div>

          {/* Home indicator */}
          <div aria-hidden className="flex justify-center bg-[var(--wash)] py-2">
            <div className="h-1 w-28 rounded-full bg-[var(--ink)]/25" />
          </div>
        </div>
      </div>
    </div>
  );
}
