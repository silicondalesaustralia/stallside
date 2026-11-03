import Image from "next/image";

/** Code-built preview of the publish step, laid over the create screen at an angle. */
export default function HomeSocialPostShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-6 right-2 hidden w-[270px] rotate-[-2.5deg] select-none overflow-hidden rounded-lg border border-[#d9d5c9] bg-white shadow-[0_18px_45px_#17361f30] sm:block lg:w-[300px]"
    >
      <div className="flex items-center justify-between border-b border-[#eee] px-3 py-1.5 text-[9px] font-black text-[#111]">
        Ready to post
        <span className="rounded-full bg-[#e8f5e9] px-2 py-0.5 text-[8px] font-bold text-[#2e7d32]">Instagram · Facebook</span>
      </div>
      <div className="flex gap-2.5 p-3">
        <Image
          src="/gallery/fletchers-artisan-soaps.jpg"
          alt=""
          width={819}
          height={1024}
          sizes="64px"
          className="size-16 shrink-0 rounded object-cover"
        />
        <p className="text-[8.5px] leading-snug text-[#444]">
          Fresh batch just cured! Our Goat’s Milk &amp; Honey Soap is back on the shelf. Grab yours at the farm gate or
          online. #handmadesoap #shoplocal
        </p>
      </div>
      <div className="px-3 pb-3">
        <p className="mb-1 text-[8px] font-bold uppercase text-[#888]">Posting method</p>
        <div className="mb-2.5 grid grid-cols-2 gap-1.5 text-[9px]">
          <span className="rounded border-2 border-black px-2 py-1 font-semibold text-[#333]">● Automatic</span>
          <span className="rounded border border-[#ddd] px-2 py-1 text-[#888]">○ Manual</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-black">
          <span className="rounded-md bg-black py-1.5 text-center text-white">Post now</span>
          <span className="rounded-md border border-[#ddd] py-1.5 text-center text-[#333]">Schedule</span>
        </div>
      </div>
    </div>
  );
}
