import Image from "next/image";

const SETTINGS = [
  { label: "Layout", value: "Classic" },
  { label: "Photo shape", value: "Tall (4:5)" },
] as const;

const TOGGLES = [
  { label: "Show review stars & rating", on: true },
  { label: "Show payment options", on: true },
  { label: "Show breadcrumbs", on: false },
] as const;

/** Code-built preview of the product page editor, laid over the site editor at an angle. */
export default function HomeProductEditorShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-3 right-4 hidden w-[340px] rotate-[2.5deg] select-none overflow-hidden rounded-lg border border-[#d9d5c9] bg-white shadow-[0_18px_45px_#17361f30] sm:block lg:w-[380px]"
    >
      <div className="flex items-center gap-1.5 border-b border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-[8px] font-semibold text-[var(--field)]">
        <span className="rounded-[var(--radius-pill)] bg-[var(--field)] px-2 py-0.5 text-white">EDITING</span>
        <span className="rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-2 py-0.5">Product page ▾</span>
      </div>
      <div className="flex">
        <div className="grid min-w-0 flex-1 grid-cols-[0.9fr_1fr] gap-2.5 p-2.5">
          <Image
            src="/gallery/fletchers-goats-milk-soap-bars.jpg"
            alt=""
            width={819}
            height={1024}
            sizes="120px"
            className="aspect-[4/5] w-full rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="text-[7px] text-[#777]">Shop All / Soaps</p>
            <p className="mt-0.5 text-[12px] font-semibold leading-tight text-black">Goat’s Milk &amp; Honey Soap</p>
            <p className="mt-0.5 text-[8px] text-[#c38a27]">
              ★★★★★ <span className="text-[#777]">(18)</span>
            </p>
            <p className="mt-1 text-[11px] font-semibold text-black">$9.00</p>
            <p className="mt-1 text-[7px] leading-snug text-[#555]">Handmade with our own goat’s milk and local honey.</p>
            <span className="mt-1.5 block rounded bg-black py-1 text-center text-[8px] font-semibold text-white">Add to cart</span>
            <p className="mt-1 text-[6.5px] text-[#777]">Card · Apple Pay · PayID · Cash on pick-up</p>
          </div>
        </div>
        <div className="w-[118px] shrink-0 border-l border-[var(--line)] bg-[var(--panel)] p-2">
          <p className="text-[9px] font-bold text-[var(--field)]">Product page</p>
          {SETTINGS.map((s) => (
            <div key={s.label} className="mt-1.5">
              <p className="text-[7px] font-semibold text-[var(--field)]">{s.label}</p>
              <p className="mt-0.5 rounded border border-[var(--line)] bg-white px-1.5 py-0.5 text-[7.5px]">{s.value} ▾</p>
            </div>
          ))}
          {TOGGLES.map((t) => (
            <p key={t.label} className="mt-1.5 flex items-start gap-1 text-[7px] leading-tight text-[var(--ink)]">
              <span
                className={`mt-px inline-flex size-2.5 shrink-0 items-center justify-center rounded-sm border text-[6px] ${
                  t.on ? "border-[var(--leaf)] bg-[var(--leaf)] text-white" : "border-[var(--line)] bg-white"
                }`}
              >
                {t.on ? "✓" : ""}
              </span>
              {t.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
