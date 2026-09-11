"use client";

import type { CSSProperties } from "react";
import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import type { DemoKit } from "@/lib/website/demo-kits";
import { formatKitPrice, resolveKitText } from "@/lib/website/demo-kits";

type Props = {
  blueprint: WebsiteBlueprint;
  kit: DemoKit;
  businessName: string;
  expanded?: boolean;
};

function Img({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} style={style} />
  );
}

export default function DemoHero({ blueprint, kit, businessName, expanded }: Props) {
  const copy = kit.copy;
  const hero = blueprint.layout.hero;
  const pad = expanded ? "p-4" : "p-2";
  const title =
    blueprint.brandKit.typography.headingCase === "UPPER"
      ? copy.headline.short.toUpperCase()
      : copy.headline.medium;

  if (hero === "EDITORIAL_STACK") {
    return (
      <div className={pad}>
        <h3 className="text-[13px] leading-tight sm:text-lg" style={{ fontFamily: "var(--demo-display)", letterSpacing: "var(--demo-tracking)" }}>
          {copy.headline.long}
        </h3>
        <p className="mt-1 max-w-[90%] text-[7px] sm:text-[9px]" style={{ color: "var(--demo-muted)", fontFamily: "var(--demo-body)" }}>
          {copy.subhead}
        </p>
        <div className="mt-2 aspect-[21/9] overflow-hidden">
          <Img src={kit.images.heroWide} className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (hero === "SPLIT_CATEGORY_TILES") {
    return (
      <div className={`grid grid-cols-2 gap-2 ${pad}`}>
        <div className="flex flex-col justify-center gap-1">
          <h3 className="text-[11px] leading-tight sm:text-base" style={{ fontFamily: "var(--demo-display)" }}>{title}</h3>
          <p className="text-[7px]" style={{ color: "var(--demo-muted)" }}>{copy.subhead}</p>
          <span className="mt-1 w-fit px-2 py-0.5 text-[6px] font-semibold" style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)", borderRadius: "var(--demo-radius)" }}>
            {copy.cta.primary}
          </span>
          <p className="text-[6px]" style={{ color: "var(--demo-muted)" }}>Next pickup: Saturday</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {kit.categories.map((c) => (
            <div key={c.id} className="overflow-hidden" style={{ borderRadius: "var(--demo-radius)", background: "var(--demo-surface)" }}>
              <Img src={c.tilePackshotPath} className="aspect-square w-full object-cover" />
              <p className="truncate px-1 py-0.5 text-[6px]">{c.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hero === "ARCH_FRAME") {
    return (
      <div className={`${pad} text-center`}>
        <h3 className="text-[12px] sm:text-base" style={{ fontFamily: "var(--demo-display)" }}>{title}</h3>
        <p className="mx-auto mt-1 max-w-[80%] text-[7px]" style={{ color: "var(--demo-muted)" }}>{copy.subhead}</p>
        <span className="mt-2 inline-block border px-2 py-0.5 text-[6px]" style={{ borderColor: "var(--demo-primary)", color: "var(--demo-primary)" }}>
          {copy.cta.primary}
        </span>
        <div className="mx-auto mt-3 aspect-[16/10] max-w-[85%] overflow-hidden" style={{ borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px" }}>
          <Img src={kit.images.heroWide} className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (hero === "FRAMED_INSET") {
    return (
      <div className={`${pad} py-4`}>
        <div className="mx-auto max-w-[75%] overflow-hidden">
          <Img src={kit.images.heroWide} className="aspect-[3/2] w-full object-cover" />
        </div>
        <div className="mt-2 flex items-baseline justify-between px-[12.5%]">
          <h3 className="text-[9px] tracking-widest uppercase" style={{ fontFamily: "var(--demo-display)" }}>{copy.headline.short}</h3>
          <span className="text-[7px] underline" style={{ color: "var(--demo-muted)" }}>{copy.cta.primary} →</span>
        </div>
      </div>
    );
  }

  if (hero === "TYPE_BLOCK") {
    const cutout = kit.products.find((p) => p.cutoutPath)?.cutoutPath ?? kit.products[0]!.packshotPath;
    return (
      <div className="relative overflow-hidden" style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)" }}>
        <div className={`grid grid-cols-2 items-end gap-2 ${pad} py-4`}>
          <div>
            <h3 className="text-[16px] font-black uppercase leading-none sm:text-2xl" style={{ fontFamily: "var(--demo-display)" }}>
              {copy.headline.short}
            </h3>
            <span className="mt-2 inline-block px-2 py-1 text-[6px] font-bold uppercase" style={{ background: "var(--demo-accent)", color: "var(--demo-on-accent)" }}>
              {copy.cta.primary}
            </span>
          </div>
          <Img src={cutout} className="ml-auto h-20 w-20 object-contain sm:h-28 sm:w-28" />
        </div>
      </div>
    );
  }

  if (hero === "INFO_PANEL") {
    return (
      <div className={`grid grid-cols-2 gap-2 ${pad}`}>
        <div>
          <h3 className="text-[11px] leading-tight sm:text-base" style={{ fontFamily: "var(--demo-display)" }}>{title}</h3>
          <Img src={kit.images.place} className="mt-2 aspect-[4/3] w-full object-cover" style={{ borderRadius: "var(--demo-radius)" }} />
        </div>
        <div className="rounded-lg p-2 text-[6px]" style={{ background: "var(--demo-surface)", borderRadius: "var(--demo-radius)" }}>
          <p className="font-semibold text-[8px]">Visit us</p>
          <p className="mt-1" style={{ color: "var(--demo-muted)" }}>Hours · 8am–1pm Sat</p>
          <p style={{ color: "var(--demo-muted)" }}>Pickup at the stand</p>
          <p style={{ color: "var(--demo-muted)" }}>Next drop · Saturday</p>
          <span className="mt-2 inline-block px-2 py-0.5 text-[6px]" style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)", borderRadius: 999 }}>
            Directions
          </span>
        </div>
      </div>
    );
  }

  if (hero === "COLLAGE_TRIO") {
    return (
      <div className={`grid grid-cols-2 gap-1 ${pad}`}>
        <Img src={kit.images.heroPortrait} className="row-span-2 h-full min-h-[110px] w-full object-cover" />
        <div className="flex flex-col justify-center gap-1 p-1">
          <h3 className="text-[11px] leading-tight sm:text-sm" style={{ fontFamily: "var(--demo-display)" }}>
            {copy.headline.medium}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Img src={kit.images.place} className="aspect-square w-full object-cover" />
          <Img src={kit.images.process} className="aspect-square w-full object-cover" />
        </div>
      </div>
    );
  }

  if (hero === "PROMO_BANNER") {
    return (
      <div>
        <div className="relative aspect-[4/1] overflow-hidden">
          <Img src={kit.images.heroWide} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-between px-3" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.45), transparent)" }}>
            <p className="text-[9px] font-semibold text-white sm:text-xs">{copy.promo}</p>
            <span className="px-2 py-0.5 text-[6px] font-semibold text-white" style={{ background: "var(--demo-accent)", color: "var(--demo-on-accent)" }}>
              {copy.cta.primary}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (hero === "PRODUCT_FEATURE") {
    const featured = kit.products.find((p) => p.badge === "NEW") ?? kit.products[0]!;
    return (
      <div className={pad}>
        <div className="grid grid-cols-2 items-center gap-2 p-2" style={{ background: "var(--demo-surface)", borderRadius: "var(--demo-radius)" }}>
          <Img src={kit.images.heroPortrait} className="aspect-square w-full object-cover" style={{ borderRadius: "calc(var(--demo-radius) - 4px)" }} />
          <div>
            <p className="text-[6px] uppercase tracking-wide" style={{ color: "var(--demo-muted)" }}>Featured</p>
            <h3 className="mt-1 text-[10px] leading-tight sm:text-sm" style={{ fontFamily: "var(--demo-display)" }}>{featured.name}</h3>
            <p className="mt-1 text-[8px]">{formatKitPrice(featured.priceCents)}</p>
            <span className="mt-2 inline-block px-2 py-0.5 text-[6px]" style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)", borderRadius: 999 }}>
              Add to bag
            </span>
          </div>
        </div>
      </div>
    );
  }

  // SPLIT_MEDIA (modern-store default)
  return (
    <div className={`grid grid-cols-2 gap-2 ${pad}`}>
      <div className="flex flex-col justify-center gap-1">
        <h3 className="text-[11px] leading-tight sm:text-base" style={{ fontFamily: "var(--demo-display)" }}>{title}</h3>
        <p className="text-[7px]" style={{ color: "var(--demo-muted)" }}>{copy.subhead}</p>
        <div className="mt-1 flex gap-1">
          <span className="px-2 py-0.5 text-[6px] font-semibold" style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)", borderRadius: "var(--demo-radius)" }}>
            {copy.cta.primary}
          </span>
          <span className="px-2 py-0.5 text-[6px]" style={{ color: "var(--demo-muted)" }}>
            {resolveKitText(copy.about.heading, businessName)}
          </span>
        </div>
      </div>
      <Img src={kit.images.heroPortrait} className="aspect-square w-full object-cover" style={{ borderRadius: "var(--demo-radius)" }} />
    </div>
  );
}
