"use client";

import { useEffect, useRef } from "react";

/**
 * Publishes the sticky editor toolbar's height as `--studio-toolbar-h` on the editor
 * root, so the settings panel can stick just below it (the toolbar wraps on narrow screens).
 */
export function useStickyToolbarHeight() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    const root = el?.closest<HTMLElement>(".vendl-studio-editor");
    if (!el || !root) return;
    const update = () => root.style.setProperty("--studio-toolbar-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
