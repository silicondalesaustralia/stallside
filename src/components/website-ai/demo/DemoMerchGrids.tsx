"use client";

import type { DemoKit } from "@/lib/website/demo-kits";
import { AboutSplit, ProductCell, formatKitPrice } from "./DemoMerchBits";

type Props = { kit: DemoKit; aboutHeading: string; aboutShort: string };

export function MerchColourBlocks({ kit }: Props) {
  return (
    <div className="px-2 pb-2">
      <p
        className="mb-1 overflow-hidden whitespace-nowrap text-[6px] uppercase tracking-widest"
        style={{ color: "var(--demo-muted)" }}
      >
        {kit.categories.map((c) => c.name).join(" — ")} —
      </p>
      <div className="mb-2 grid grid-cols-2 gap-1">
        {kit.categories.slice(0, 2).map((c, i) => (
          <div
            key={c.id}
            className="p-2 text-[7px] font-bold uppercase"
            style={{
              background: i === 0 ? "var(--demo-primary)" : "var(--demo-accent)",
              color: i === 0 ? "var(--demo-on-primary)" : "var(--demo-on-accent)",
            }}
          >
            {c.name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {kit.products.slice(0, 4).map((p) => (
          <ProductCell
            key={p.id}
            name={p.name}
            price={formatKitPrice(p.priceCents)}
            src={p.packshotPath}
            dense
          />
        ))}
      </div>
    </div>
  );
}

export function MerchDenseGrid({ kit }: Props) {
  return (
    <div className="px-2 pb-2">
      <div className="mb-1 flex flex-wrap gap-1">
        {kit.categories.map((c) => (
          <span
            key={c.id}
            className="border px-1 py-0.5 text-[5px]"
            style={{ borderColor: "var(--demo-surface)" }}
          >
            {c.name} {kit.products.filter((p) => p.categoryId === c.id).length}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {kit.products.map((p) => (
          <ProductCell
            key={p.id}
            name={p.name}
            price={formatKitPrice(p.priceCents)}
            src={p.packshotPath}
            dense
          />
        ))}
      </div>
    </div>
  );
}

export function MerchCurated({ kit, aboutHeading, aboutShort }: Props) {
  return (
    <div className="px-2 pb-2">
      <p className="mb-1 text-center text-[8px]" style={{ fontFamily: "var(--demo-display)" }}>
        The collection edit
      </p>
      <div className="mb-2 grid grid-cols-3 gap-1">
        {kit.categories.slice(0, 3).map((c) => (
          <div
            key={c.id}
            className="overflow-hidden"
            style={{ borderRadius: "var(--demo-radius)", background: "var(--demo-surface)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.tilePackshotPath} alt="" className="aspect-[3/4] w-full object-cover" />
            <p className="px-1 py-1 text-center text-[6px]">{c.name}</p>
          </div>
        ))}
      </div>
      <AboutSplit heading={aboutHeading} body={aboutShort} imageSrc={kit.images.place} />
    </div>
  );
}

export function MerchCategoryRows({ kit }: Props) {
  const cat = kit.categories[0]!;
  const row = kit.products.filter((p) => p.categoryId === cat.id).slice(0, 5);
  return (
    <div className="px-2 pb-2">
      <div className="mb-1 flex justify-between text-[7px]">
        <span className="font-semibold">{cat.name}</span>
        <span style={{ color: "var(--demo-muted)" }}>See all →</span>
      </div>
      <div className="flex gap-1.5 overflow-hidden">
        {row.map((p) => (
          <div key={p.id} className="w-[18%] shrink-0">
            <ProductCell
              name={p.name}
              price={formatKitPrice(p.priceCents)}
              src={p.packshotPath}
              dense
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MerchTabbed({ kit, aboutHeading, aboutShort }: Props) {
  return (
    <div className="px-2 pb-2">
      <div className="mb-1 flex gap-2 text-[7px]">
        <span className="font-semibold">Featured</span>
        <span style={{ color: "var(--demo-muted)" }}>New</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {kit.products.slice(0, 4).map((p) => (
          <ProductCell
            key={p.id}
            name={p.name}
            price={formatKitPrice(p.priceCents)}
            src={p.packshotPath}
          />
        ))}
      </div>
      <AboutSplit heading={aboutHeading} body={aboutShort} imageSrc={kit.images.process} />
    </div>
  );
}

export function MerchLargeGrid({ kit }: Props) {
  return (
    <div className="px-3 pb-3">
      <div className="grid grid-cols-2 gap-3">
        {kit.products.slice(0, 4).map((p) => (
          <div key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.packshotPath} alt="" className="aspect-[4/5] w-full object-cover" />
            <div className="mt-1 flex justify-between gap-1 text-[7px]">
              <span className="truncate">{p.name}</span>
              <span>{formatKitPrice(p.priceCents)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MerchFeatureRows({ kit, aboutHeading, aboutShort }: Props) {
  const review = kit.copy.reviews[0]!;
  return (
    <div className="px-2 pb-2">
      <div className="mb-2 grid grid-cols-2 gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={kit.images.heroPortrait} alt="" className="aspect-[4/5] w-full object-cover" />
        <div className="flex flex-col justify-center">
          <p className="text-[9px]" style={{ fontFamily: "var(--demo-display)" }}>
            {aboutHeading}
          </p>
          <p className="mt-1 text-[6px] leading-relaxed" style={{ color: "var(--demo-muted)" }}>
            {aboutShort}
          </p>
        </div>
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
      <div className="mt-2 px-2 py-2 text-center" style={{ background: "var(--demo-surface)" }}>
        <p className="text-[7px] italic" style={{ color: "var(--demo-muted)" }}>
          “{review.text}”
        </p>
        <p className="mt-1 text-[6px]">— {review.name}</p>
      </div>
    </div>
  );
}
