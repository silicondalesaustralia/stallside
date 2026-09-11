"use client";

import { formatKitPrice } from "@/lib/website/demo-kits";

export function ProductCell({
  name,
  price,
  src,
  dense,
}: {
  name: string;
  price: string;
  src: string;
  dense?: boolean;
}) {
  return (
    <div>
      <div
        className="aspect-square overflow-hidden"
        style={{ background: "var(--demo-surface)", borderRadius: "var(--demo-radius)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
      <p className={`mt-0.5 truncate font-medium leading-tight ${dense ? "text-[5px]" : "text-[7px]"}`}>
        {name}
      </p>
      <p className={dense ? "text-[5px]" : "text-[6px]"} style={{ color: "var(--demo-muted)" }}>
        {price}
      </p>
    </div>
  );
}

export function AboutSplit({
  heading,
  body,
  imageSrc,
}: {
  heading: string;
  body: string;
  imageSrc: string;
}) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className="aspect-[4/3] w-full object-cover"
        style={{ borderRadius: "var(--demo-radius)" }}
      />
      <div className="flex flex-col justify-center">
        <p className="text-[8px]" style={{ fontFamily: "var(--demo-display)" }}>
          {heading}
        </p>
        <p className="mt-1 text-[6px] leading-relaxed" style={{ color: "var(--demo-muted)" }}>
          {body}
        </p>
      </div>
    </div>
  );
}

export { formatKitPrice };
