import Image from "next/image";

const POSTS = [
  { day: "MON", title: "Fresh batch: Goat’s Milk & Honey", photo: "/gallery/fletchers-goats-milk-soap-bars.jpg", status: "Approved" },
  { day: "WED", title: "Behind the scenes at the farm shop", photo: "/gallery/jacaranda-hill-farm-shop.jpg", status: "Approved" },
  { day: "FRI", title: "Weekend eggs at the gate", photo: "/gallery/jacaranda-hill-pasture-raised-eggs.jpg", status: "Designs ready" },
  { day: "SAT", title: "Christmas gift sets are here", photo: "/gallery/fletchers-artisan-soaps.jpg", status: "Designs ready" },
] as const;

/** Code-built preview of the social week planner. */
export default function MakersLpWeekPlanShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_8px_25px_#17361f16]"
    >
      <div className="border-b border-[#FFD100]/40 bg-gradient-to-r from-[#FFFBEA] to-white px-3 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-wide text-[#886600]">Plan your whole week</p>
        <p className="text-[11px] font-black text-[#111]">Week of 9 Nov · 4 posts</p>
      </div>
      <ul className="divide-y divide-[#f0f0f0]">
        {POSTS.map((p) => (
          <li key={p.day} className="flex items-center gap-2.5 px-3 py-2">
            <span className="w-6 text-[8px] font-black text-[#999]">{p.day}</span>
            <Image src={p.photo} alt="" width={64} height={64} sizes="32px" className="size-8 shrink-0 rounded object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[9.5px] font-semibold text-[#222]">{p.title}</span>
              <span className="block text-[8px] text-[#999]">Instagram · Facebook</span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[7.5px] font-bold ${
                p.status === "Approved" ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#FFF4CC] text-[#886600]"
              }`}
            >
              {p.status}
            </span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-1.5 border-t border-[#f0f0f0] p-3 text-[9.5px] font-black">
        <span className="rounded-md border border-[#ddd] py-1.5 text-center text-[#333]">Review designs</span>
        <span className="rounded-md bg-[#FFD700] py-1.5 text-center text-black">Add all to calendar</span>
      </div>
    </div>
  );
}
