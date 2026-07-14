"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Scale children (at a fixed mm size) to fit the parent without cropping. */
export default function FitScale({
  widthMm,
  heightMm,
  children,
}: {
  widthMm: number;
  heightMm: number;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.05);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const update = () => {
      const sheet = frame.querySelector<HTMLElement>("[data-fit-scale-sheet]");
      if (!sheet) return;
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      const sw = sheet.offsetWidth;
      const sh = sheet.offsetHeight;
      if (sw < 1 || sh < 1 || fw < 1 || fh < 1) return;
      setScale(Math.min(fw / sw, fh / sh));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [widthMm, heightMm]);

  return (
    <div ref={frameRef} className="relative h-full w-full overflow-hidden">
      <div
        data-fit-scale-sheet
        className="bg-white"
        style={{
          width: `${widthMm}mm`,
          height: `${heightMm}mm`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
