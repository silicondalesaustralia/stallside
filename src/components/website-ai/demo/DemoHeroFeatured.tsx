"use client";

import type { DemoKit } from "@/lib/website/demo-kits";

function Img({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  );
}

export function HeroFullBleed({
  kit,
  headline,
  subhead,
  cta,
}: {
  kit: DemoKit;
  headline: string;
  subhead: string;
  cta: string;
}) {
  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Img src={kit.images.heroWide} className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-end px-3 pb-3 text-center sm:pb-5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.55), transparent 55%)" }}
        >
          <h3
            className="max-w-[90%] text-[14px] leading-tight text-white sm:text-xl"
            style={{ fontFamily: "var(--demo-display)" }}
          >
            {headline}
          </h3>
          <p className="mt-1 max-w-[85%] text-[7px] text-white/90 sm:text-[9px]">{subhead}</p>
          <span
            className="mt-2 inline-block px-2.5 py-1 text-[6px] font-semibold sm:text-[8px]"
            style={{
              background: "var(--demo-primary)",
              color: "var(--demo-on-primary)",
              borderRadius: 999,
            }}
          >
            {cta}
          </span>
        </div>
      </div>
      <div
        className="mx-auto grid max-w-[92%] grid-cols-3 gap-2 px-2 py-2 text-center text-[6px]"
        style={{ background: "var(--demo-surface)" }}
      >
        <div>
          <p className="font-semibold">Hours</p>
          <p style={{ color: "var(--demo-muted)" }}>Sat 8am–1pm</p>
        </div>
        <div>
          <p className="font-semibold">Pickup</p>
          <p style={{ color: "var(--demo-muted)" }}>At the stand</p>
        </div>
        <div>
          <p className="font-semibold">Next drop</p>
          <p style={{ color: "var(--demo-muted)" }}>Saturday</p>
        </div>
      </div>
    </div>
  );
}

export function HeroEditorialStack({
  kit,
  headline,
  subhead,
  cta,
}: {
  kit: DemoKit;
  headline: string;
  subhead: string;
  cta: string;
}) {
  return (
    <div className="p-2 text-center sm:p-4">
      <h3
        className="mx-auto max-w-[92%] text-[13px] leading-tight sm:text-lg"
        style={{ fontFamily: "var(--demo-display)", letterSpacing: "var(--demo-tracking)" }}
      >
        {headline}
      </h3>
      <p
        className="mx-auto mt-1 max-w-[80%] text-[7px] sm:text-[9px]"
        style={{ color: "var(--demo-muted)", fontFamily: "var(--demo-body)" }}
      >
        {subhead}
      </p>
      <span
        className="mt-2 inline-block px-2 py-0.5 text-[6px] font-semibold"
        style={{
          background: "var(--demo-primary)",
          color: "var(--demo-on-primary)",
          borderRadius: "var(--demo-radius)",
        }}
      >
        {cta}
      </span>
      <div className="mt-3 aspect-[21/9] w-full overflow-hidden">
        <Img src={kit.images.heroWide} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
