"use client";

import type { MouseEvent, ReactNode } from "react";

type Props = {
  targetId: string;
  className?: string;
  children: ReactNode;
};

/** In-page anchor that scrolls smoothly unless the user prefers reduced motion. */
export default function LpScrollLink({ targetId, className, children }: Props) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  return (
    <a href={`#${targetId}`} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
