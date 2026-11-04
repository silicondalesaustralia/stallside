import Image from "next/image";

const TABS = ["Create", "Planner", "Library", "Videos"] as const;

const PLATFORMS = [
  { label: "Instagram (1080×1080)", on: true },
  { label: "Facebook (1200×630)", on: true },
  { label: "Google Business (1080×1350)", on: false },
] as const;

const STYLES = ["Bold", "Soft", "Market sign"] as const;

function Tick({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex size-3 shrink-0 items-center justify-center rounded-sm border text-[7px] ${
        on ? "border-black bg-black text-white" : "border-[#ccc] bg-white"
      }`}
    >
      {on ? "✓" : ""}
    </span>
  );
}

/** Code-built preview of the Social create screen. */
export default function MakersLpSocialCreateShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_8px_25px_#17361f16]"
    >
      <div className="flex items-center gap-1 border-b border-[#eee] px-3 py-2 text-[10px] font-bold text-[#111]">
        <span className="mr-2 text-[11px] font-black">Social</span>
        {TABS.map((tab, i) => (
          <span key={tab} className={`rounded-full px-2.5 py-0.5 ${i === 0 ? "bg-[#F5C518]" : "text-[#888]"}`}>
            {tab}
          </span>
        ))}
        <span className="ml-auto hidden rounded-full border border-[#eee] px-2 py-0.5 text-[9px] text-[#666] sm:inline">
          Credits: 4 designs · 5 clips
        </span>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="relative overflow-hidden rounded-md">
          <Image
            src="/gallery/fletchers-artisan-soaps.jpg"
            alt=""
            width={819}
            height={1024}
            sizes="260px"
            className="aspect-square w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 pt-8 text-white">
            <p className="text-[8px] font-bold tracking-[0.14em] text-[#F5C518]">FRESH BATCH</p>
            <p className="text-[13px] font-black leading-tight sm:text-[15px]">Goat’s Milk &amp; Honey Soap</p>
            <p className="mt-0.5 text-[8px] opacity-80">Fletcherbrook Farm · shop link in bio</p>
          </div>
        </div>
        <div className="min-w-0 text-[9px] text-[#333]">
          <p className="mb-1 font-semibold text-[#666]">Product</p>
          <p className="mb-2.5 rounded border border-[#ddd] px-2 py-1">Goat’s Milk &amp; Honey Soap ▾</p>
          <p className="mb-1 font-semibold text-[#666]">Platforms</p>
          {PLATFORMS.map((p) => (
            <p key={p.label} className="mb-1 flex items-center gap-1.5">
              <Tick on={p.on} />
              <span className="truncate">{p.label}</span>
            </p>
          ))}
          <p className="mb-1 mt-2 font-semibold text-[#666]">Text style</p>
          <div className="mb-2.5 flex flex-wrap gap-1">
            {STYLES.map((s, i) => (
              <span key={s} className={`rounded-full border px-2 py-0.5 ${i === 0 ? "border-black bg-black text-white" : "border-[#ddd]"}`}>
                {s}
              </span>
            ))}
          </div>
          <span className="block rounded-md bg-[#F5C518] py-1.5 text-center text-[10px] font-black text-black">
            Generate post
          </span>
        </div>
      </div>
    </div>
  );
}
