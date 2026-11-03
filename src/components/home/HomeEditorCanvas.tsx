import Image from "next/image";

const NAV = ["Home", "Shop All", "Pre Orders", "Memberships", "FAQ", "Contact"] as const;

/** The Fletcherbrook storefront as it appears inside the website editor. */
export default function HomeEditorCanvas() {
  return (
    <div className="min-w-0 flex-1 bg-white">
      <p className="bg-[#f7941d] py-1 text-center text-[9px] font-semibold text-black sm:text-[10px]">
        Fresh this week · order by Thursday for weekend pick-up
      </p>
      <div className="flex items-center justify-between gap-3 bg-black px-3 py-2.5 text-white sm:px-5">
        <span className="flex size-9 items-center justify-center rounded-full border border-white/70 text-[6px] font-bold leading-tight tracking-wide">
          THE
          <br />
          FLETCHERS
        </span>
        <nav className="hidden gap-3 text-[10px] lg:flex">
          {NAV.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </nav>
        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-black">Cart (0)</span>
      </div>
      <div className="relative border-2 border-dashed border-[#5b8def]/70">
        <span className="absolute left-0 top-0 bg-[#5b8def] px-1.5 py-0.5 text-[8px] font-semibold text-white">Hero</span>
        <div className="grid grid-cols-[1.1fr_1fr] items-center gap-3 bg-[#f4f4f2] px-4 py-5 sm:gap-5 sm:px-6 sm:py-7">
          <div>
            <p className="font-[family-name:'Source_Sans_3','Helvetica_Neue',Arial,sans-serif] text-[17px] font-semibold leading-tight text-black sm:text-[24px]">
              Fletcherbrook Small Farm
            </p>
            <p className="mt-2 text-[9px] leading-snug text-[#444] sm:text-[11px]">
              Shop goat’s milk soaps, cleaning products and personal care from our family living sustainably in
              Donnybrook, WA.
            </p>
            <span className="mt-3 inline-block rounded bg-black px-3 py-1.5 text-[9px] font-semibold text-white">Shop now</span>
          </div>
          <div className="relative">
            <Image
              src="/gallery/fletchers-artisan-soaps.jpg"
              alt=""
              width={819}
              height={1024}
              sizes="220px"
              className="h-[130px] w-full rounded-xl object-cover sm:h-[170px]"
            />
            <Image
              src="/gallery/fletchers-goats-milk-soap-bars.jpg"
              alt=""
              width={819}
              height={1024}
              sizes="110px"
              className="absolute -bottom-3 -right-2 h-[70px] w-[56px] rounded-lg border-2 border-white object-cover shadow-md sm:h-[92px] sm:w-[74px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
