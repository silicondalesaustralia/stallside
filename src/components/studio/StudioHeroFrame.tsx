import type { ReactNode } from "react";

export type HeroWidth = "full" | "contained";

/** "contained" insets the hero to the content width with rounded corners. */
export default function StudioHeroFrame({
  width,
  children,
}: {
  width?: string;
  children: ReactNode;
}) {
  if (width !== "contained") return <>{children}</>;
  return <div className="studio-hero-frame">{children}</div>;
}
