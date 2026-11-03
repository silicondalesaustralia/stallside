import Image from "next/image";

const CLIPS = [
  { photo: "/gallery/jacaranda-hill-farm-shop.jpg", caption: "MARKET DAY PREP", time: "0:24" },
  { photo: "/gallery/fletchers-goats-milk-soap-bars.jpg", caption: "CUTTING THE NEW BATCH", time: "0:31" },
  { photo: "/lp/green-valley-eggs-stallside-stand.jpg", caption: "FRESH AT THE GATE", time: "0:18" },
] as const;

const SEGMENTS = ["left-[8%] w-[10%]", "left-[41%] w-[13%]", "left-[77%] w-[8%]"] as const;

const OPTIONS = ["3 clips", "Short", "Vertical", "Bold captions"] as const;

/** Code-built preview of AI video clipping: one long video in, short captioned clips out. */
export default function HomeVideoClipShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_8px_25px_#17361f16]"
    >
      <div className="border-b border-[#eee] px-3 py-2.5">
        <p className="flex justify-between text-[9.5px] font-semibold text-[#222]">
          market-day-vlog.mp4 <span className="font-normal text-[#999]">4:12</span>
        </p>
        <div className="relative mt-1.5 h-2.5 rounded-full bg-[#eee]">
          {SEGMENTS.map((pos) => (
            <span key={pos} className={`absolute inset-y-0 rounded-full bg-[#F5C518] ${pos}`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {OPTIONS.map((o) => (
            <span key={o} className="rounded-full border border-[#ddd] px-2 py-0.5 text-[7.5px] font-semibold text-[#555]">
              {o}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {CLIPS.map((c) => (
          <div key={c.caption} className="relative overflow-hidden rounded-md bg-black">
            <Image src={c.photo} alt="" width={240} height={426} sizes="110px" className="aspect-[9/16] w-full object-cover opacity-90" />
            <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[7px] font-semibold text-white">{c.time}</span>
            <span className="absolute inset-x-1 bottom-6 text-center text-[8px] font-black leading-tight text-white [text-shadow:0_1px_3px_#000]">
              {c.caption}
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-white/95 py-0.5 text-center text-[7.5px] font-black text-black">
              Post clip
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
