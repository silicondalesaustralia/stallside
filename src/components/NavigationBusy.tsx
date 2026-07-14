"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInternalNavigate(anchor: HTMLAnchorElement) {
  if (anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.getAttribute("rel")?.includes("external")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      return new URL(href).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return true;
}

function shouldStartFromClick(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a[href]");
  if (anchor instanceof HTMLAnchorElement) return isInternalNavigate(anchor);

  const button = target.closest("button");
  if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
  if (button.closest("[data-busy-ignore]")) return false;
  const type = button.getAttribute("type") ?? "submit";
  return type === "submit";
}

/** Top loading bar for navigations and form submits while the next page paints. */
export default function NavigationBusy() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    setBusy(false);
  }, [routeKey]);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-busy", busy);
    return () => document.documentElement.classList.remove("nav-busy");
  }, [busy]);

  useEffect(() => {
    let safetyTimer = 0;

    const start = (maxMs: number) => {
      setBusy(true);
      window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(() => setBusy(false), maxMs);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (shouldStartFromClick(event.target)) start(10000);
    };

    const onSubmit = (event: Event) => {
      if (event.defaultPrevented) return;
      const form = event.target;
      if (form instanceof HTMLFormElement && form.closest("[data-busy-ignore]")) return;
      start(3500);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (!busy) return null;

  return (
    <>
      <div className="nav-busy-bar" aria-hidden />
      <span className="sr-only" role="status" aria-live="polite">
        Loading
      </span>
    </>
  );
}
