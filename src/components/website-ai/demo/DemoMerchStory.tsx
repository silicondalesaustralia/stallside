"use client";

import type { DemoKit } from "@/lib/website/demo-kits";
import { AboutSplit, ProductCell, formatKitPrice } from "./DemoMerchBits";

type Props = { kit: DemoKit; aboutHeading: string; aboutShort: string; showCount: number };

export function MerchStoryMenu({ kit, showCount }: Props) {
  return (
    <div className="px-2 pb-2">
      <div className="mb-2 grid grid-cols-3 gap-1 text-center">
        {kit.copy.about.pillars.map((p) => (
          <div key={p} className="px-1">
            <p className="text-[7px] font-semibold" style={{ fontFamily: "var(--demo-display)" }}>
              {p.split(" ")[0]}
            </p>
            <p className="mt-0.5 text-[5px] leading-snug" style={{ color: "var(--demo-muted)" }}>
              {p}
            </p>
          </div>
        ))}
      </div>
      <p className="mb-1 text-[7px] font-semibold">Our range</p>
      {kit.products.slice(0, showCount).map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-2 border-b py-1"
          style={{ borderColor: "var(--demo-surface)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.packshotPath} alt="" className="h-5 w-5 object-cover" />
          <span className="flex-1 truncate text-[6px]">{p.name}</span>
          <span className="text-[6px]" style={{ color: "var(--demo-muted)" }}>
            {formatKitPrice(p.priceCents)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MerchAvailableNow({ kit, aboutHeading, aboutShort }: Props) {
  return (
    <div className="px-2 pb-2">
      <p className="mb-1 text-[7px] font-semibold">Available this week</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {kit.products.slice(0, 6).map((p) => (
          <span
            key={p.id}
            className="rounded-full px-1.5 py-0.5 text-[5px]"
            style={{
              background: p.soldOut ? "var(--demo-surface)" : "var(--demo-accent)",
              color: p.soldOut ? "var(--demo-muted)" : "var(--demo-on-accent)",
            }}
          >
            {p.soldOut
              ? `${p.name.split(" ")[0]} · sold out`
              : p.name.split(" ").slice(0, 2).join(" ")}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {kit.products.slice(0, 3).map((p) => (
          <ProductCell
            key={p.id}
            name={p.name}
            price={formatKitPrice(p.priceCents)}
            src={p.packshotPath}
          />
        ))}
      </div>
      <AboutSplit heading={aboutHeading} body={aboutShort} imageSrc={kit.images.place} />
    </div>
  );
}

export function MerchGalleryProcess({ kit, aboutShort }: Props) {
  return (
    <div className="px-2 pb-2">
      <div className="mb-2 grid grid-cols-3 gap-1">
        {kit.copy.processSteps.map((step, i) => (
          <div key={step}>
            <p className="text-[8px] font-semibold" style={{ color: "var(--demo-accent)" }}>
              0{i + 1}
            </p>
            <p className="text-[6px] leading-snug">{step}</p>
          </div>
        ))}
      </div>
      <div className="mb-2 columns-2 gap-1">
        {[kit.images.place, kit.images.process, kit.products[0]!.packshotPath, kit.products[1]!.packshotPath].map(
          (src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="mb-1 w-full break-inside-avoid object-cover" />
          ),
        )}
      </div>
      <p className="text-center text-[7px]">{aboutShort}</p>
    </div>
  );
}
