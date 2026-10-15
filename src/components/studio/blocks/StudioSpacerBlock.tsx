import type { CSSProperties } from "react";

/** Empty vertical space; the phone height applies below the storefront's medium width. */
export default function StudioSpacerBlock({ height, mobileHeight }: { height: number; mobileHeight: number }) {
  return (
    <div
      aria-hidden
      className="h-[var(--spacer-m)] sf-md:h-[var(--spacer)]"
      style={{ "--spacer": `${height}px`, "--spacer-m": `${mobileHeight}px` } as CSSProperties}
    />
  );
}
