"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { BrandMarkMode } from "@/lib/storefront/header-style";
import LogoResizeHandle from "./LogoResizeHandle";

/** Header logo and/or business name. In the editor, clicking it selects the header. */
export default function StudioBrandMark({
  branding,
  brandMark,
  href,
  logoHeight,
  editable,
  resizable,
  onSelect,
  onLogoResize,
  onLogoResizeEnd,
}: {
  branding: ResolvedStorefrontBranding;
  brandMark: BrandMarkMode;
  href: string;
  logoHeight: number;
  editable?: boolean;
  resizable?: boolean;
  onSelect?: () => void;
  onLogoResize?: (height: number) => void;
  onLogoResizeEnd?: (height: number) => void;
}) {
  const hasLogo = Boolean(branding.logoUrl);
  const showLogo =
    hasLogo && (brandMark === "logo-and-name" || brandMark === "logo-only");
  const showName =
    brandMark === "name-only" ||
    brandMark === "logo-and-name" ||
    (!hasLogo && brandMark === "logo-only");
  const canResize = Boolean(resizable && onLogoResize && onLogoResizeEnd);

  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-3"
      onClick={(e) => {
        e.stopPropagation();
        if (editable) {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {showLogo && branding.logoUrl ? (
        <span
          className={`studio-nav__logo-wrap ${canResize ? "studio-nav__logo-wrap--active" : ""}`}
          style={{ "--logo-h": `${logoHeight}px` } as CSSProperties}
        >
          <Image
            src={branding.logoUrl}
            alt={showName ? "" : branding.headline}
            width={480}
            height={160}
            className="studio-nav__logo w-auto object-contain"
          />
          {canResize && onLogoResize && onLogoResizeEnd ? (
            <LogoResizeHandle height={logoHeight} onPreview={onLogoResize} onCommit={onLogoResizeEnd} />
          ) : null}
        </span>
      ) : null}
      {showName ? (
        <span className="studio-nav__brand truncate">{branding.headline}</span>
      ) : null}
    </Link>
  );
}
