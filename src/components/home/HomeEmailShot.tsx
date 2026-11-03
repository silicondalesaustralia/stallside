import Image from "next/image";

const FIELD = "rounded border border-[var(--line)] bg-white px-2 py-1";

/** Code-built preview of an email campaign going to a saved customer list. */
export default function HomeEmailShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--wash)] shadow-[0_8px_25px_#17361f16]"
    >
      <div className="flex items-center gap-1.5 border-b border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[10px] font-semibold text-[var(--field)]">
        New email campaign
        <span className="ml-auto rounded bg-[var(--field)] px-2.5 py-0.5 text-white">Send</span>
      </div>
      <div className="space-y-2 p-3 text-[9px] text-[var(--ink)] sm:p-4">
        <p className="flex items-center gap-2">
          <span className="w-12 font-semibold text-[var(--muted)]">To</span>
          <span className={`${FIELD} flex-1`}>Soap buyers, last 90 days · 214 customers ▾</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="w-12 font-semibold text-[var(--muted)]">Subject</span>
          <span className={`${FIELD} flex-1`}>It’s back: Goat’s Milk &amp; Honey Soap</span>
        </p>
        <div className="mx-auto max-w-[300px] overflow-hidden rounded-md border border-[var(--line)] bg-white">
          <Image
            src="/gallery/fletchers-goats-milk-soap-bars.jpg"
            alt=""
            width={819}
            height={1024}
            sizes="300px"
            className="h-28 w-full object-cover"
          />
          <div className="p-3 text-center">
            <p className="text-[12px] font-semibold text-black">Fresh from the curing rack</p>
            <p className="mt-1 text-[8.5px] leading-snug text-[#555]">
              You loved the last batch, so we made more. Order now and collect at the farm gate on Saturday.
            </p>
            <span className="mt-2 inline-block rounded bg-[var(--field)] px-3 py-1 text-[9px] font-semibold text-white">
              Shop the soaps
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
