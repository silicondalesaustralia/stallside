"use client";

import Link from "next/link";
import SectionButtonLink from "@/components/studio/SectionButtonLink";
import InlineEditableText from "@/components/studio/InlineEditableText";
import { isExternalLink, resolveButtonLink } from "@/lib/studio/button-link";
import type { HeroLook } from "@/lib/studio/hero-look";
import type { StudioMetadata } from "@/lib/studio/types";

const SECONDARY = "studio-btn studio-btn--secondary";

/** The main button (seller's link, else `defaultHref`) and an optional second, outlined button. */
export default function HeroButtons({
  meta,
  editable,
  showPrimary,
  label,
  defaultLabel,
  defaultHref,
  look,
}: {
  meta: StudioMetadata;
  editable: boolean;
  showPrimary: boolean;
  label: string;
  defaultLabel: string;
  defaultHref: string | null;
  look: HeroLook;
}) {
  const secondaryHref = look.secondaryLabel ? resolveButtonLink(look.secondaryLink, meta) : null;
  return (
    <>
      {showPrimary ? (
        <SectionButtonLink meta={meta} defaultHref={defaultHref} className="studio-btn studio-btn--primary">
          {editable ? (
            <InlineEditableText prop="ctaLabel" value={label || defaultLabel} as="span" placeholder={defaultLabel} />
          ) : (
            label || defaultLabel
          )}
        </SectionButtonLink>
      ) : null}
      {secondaryHref ? (
        isExternalLink(secondaryHref) ? (
          <a href={secondaryHref} className={SECONDARY} target="_blank" rel="noopener noreferrer">
            {look.secondaryLabel}
          </a>
        ) : /^(mailto|tel):/i.test(secondaryHref) ? (
          <a href={secondaryHref} className={SECONDARY}>
            {look.secondaryLabel}
          </a>
        ) : (
          <Link href={secondaryHref} className={SECONDARY}>
            {look.secondaryLabel}
          </Link>
        )
      ) : null}
    </>
  );
}

export function heroHasButtons(showPrimary: boolean, look: HeroLook, meta: StudioMetadata): boolean {
  return showPrimary || Boolean(look.secondaryLabel && resolveButtonLink(look.secondaryLink, meta));
}
