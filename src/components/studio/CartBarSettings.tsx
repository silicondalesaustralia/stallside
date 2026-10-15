"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";

/** Desktop / mobile switches for the large "View cart" bar; a site-wide setting shown wherever it's relevant. */
export default function CartBarSettings() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);
  return (
    <div className="space-y-2">
      <p className="block text-xs font-semibold text-[var(--field)]">Large &ldquo;View cart&rdquo; bar</p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={siteStyle.cartBarDesktop !== false} onChange={(e) => set("cartBarDesktop", e.target.checked ? undefined : false)} />
        Show on desktop
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={siteStyle.cartBarMobile !== false} onChange={(e) => set("cartBarMobile", e.target.checked ? undefined : false)} />
        Show on mobile
      </label>
      <p className="text-xs text-[var(--muted)]">
        Appears at the bottom of every shop page once something is in the cart. Applies to the whole site after you
        publish.
      </p>
    </div>
  );
}
