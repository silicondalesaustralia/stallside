import type { ReactNode } from "react";

/** iPhone-style chrome for desktop demo checkout. */
export default function DemoPhoneFrame({
  children,
  notification,
  size = "default",
}: {
  children: ReactNode;
  notification?: ReactNode;
  size?: "default" | "compact";
}) {
  const compact = size === "compact";

  return (
    <div className={`mx-auto w-full ${compact ? "max-w-[220px]" : "max-w-[320px]"}`}>
      <div
        className={`relative border-[var(--field)] bg-[var(--field)] shadow-[0_24px_60px_rgb(0_0_0/0.28)] ${
          compact
            ? "rounded-[2rem] border-[8px]"
            : "rounded-[2.4rem] border-[10px]"
        }`}
      >
        <div
          aria-hidden
          className={`absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black ${
            compact ? "top-2 h-5 w-16" : "top-2.5 h-6 w-24"
          }`}
        />
        <div
          className={`relative overflow-hidden bg-[var(--wash)] ${
            compact ? "rounded-[1.5rem]" : "rounded-[1.85rem]"
          }`}
        >
          <div
            aria-hidden
            className={`relative z-10 flex items-center justify-between font-semibold text-[var(--ink)] ${
              compact
                ? "px-4 pb-0.5 pt-2.5 text-[9px]"
                : "px-5 pb-1 pt-3 text-[10px]"
            }`}
          >
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm border border-current" />
              <span className="inline-block h-2.5 w-4 rounded-sm border border-current" />
            </span>
          </div>

          {notification}

          <div
            className={`relative overflow-hidden bg-[var(--wash)] ${
              compact ? "h-[380px]" : "h-[560px]"
            }`}
          >
            {children}
          </div>

          <div aria-hidden className="flex justify-center bg-[var(--wash)] py-2">
            <div
              className={`rounded-full bg-[var(--ink)]/25 ${
                compact ? "h-1 w-20" : "h-1 w-28"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
