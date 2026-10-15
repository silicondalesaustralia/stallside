import type { CSSProperties } from "react";

/**
 * Empty vertical space; the phone height applies below the storefront's medium width.
 * `hideLines` removes the divider lines above and below it (CSS in website-builder.css).
 */
export default function StudioSpacerBlock({
  height,
  mobileHeight,
  hideLines = false,
}: {
  height: number;
  mobileHeight: number;
  hideLines?: boolean;
}) {
  return (
    <div
      aria-hidden
      {...(hideLines ? { "data-spacer-no-lines": "" } : {})}
      className="h-[var(--spacer-m)] sf-md:h-[var(--spacer)]"
      style={{ "--spacer": `${height}px`, "--spacer-m": `${mobileHeight}px` } as CSSProperties}
    />
  );
}
