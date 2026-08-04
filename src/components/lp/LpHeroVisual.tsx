export default function LpHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      {/* Real stall photo does the product demo - PAY HERE QR, eggs, honey */}
      <figure className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[#2a3a2e] shadow-[0_18px_40px_-12px_rgb(23_54_31_/_0.45)]">
        <picture>
          <source
            srcSet="/lp/green-valley-eggs-stallside-stand.webp"
            type="image/webp"
          />
          <img
            src="/lp/green-valley-eggs-stallside-stand.jpg"
            alt="Green Valley Eggs roadside stall with eggs, honey, and a Stallside QR poster"
            width={819}
            height={1024}
            fetchPriority="high"
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      </figure>

      {/* Outcome callouts sit beside the photo - do not cover the QR */}
      <div className="mt-3 flex flex-wrap gap-2 sm:absolute sm:-left-3 sm:top-6 sm:mt-0 sm:max-w-[10.5rem] sm:flex-col lg:-left-6">
        <div className="rounded-xl border border-[var(--line)] bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <p className="text-[11px] font-semibold text-[var(--leaf)]">
            New sale · A$12.00
          </p>
          <p className="text-[10px] text-[var(--muted)]">Honey · just now</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <p className="text-[11px] font-semibold text-[var(--field)]">
            Stock updates itself
          </p>
          <p className="text-[10px] text-[var(--muted)]">Large eggs: 4 left</p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-[var(--muted)] sm:mt-4">
        Print the poster · they scan and pay · you get the alert
      </p>
    </div>
  );
}
