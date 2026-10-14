import Link from "next/link";
import type { ResolvedStorefrontBranding, StorefrontPageId } from "@/lib/storefront/types";
import { shopHomePath } from "@/lib/storefront/paths";
import type { StudioTemplateId } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import { isWebsiteDemoStorefrontSlug } from "@/lib/demo";
import type { FooterColumnId } from "@/lib/studio/custom-pages";
import type { LinkContext } from "@/lib/studio/button-link";
import { footerBottomLine, footerColours, type FooterSettings } from "@/lib/studio/footer-settings";
import { autoFooterColumns, resolveFooterColumns } from "@/lib/studio/footer-columns";
import { paletteOf } from "@/lib/website/sections/colour";
import StudioFooterBrand from "./StudioFooterBrand";
import StudioFooterContact from "./StudioFooterContact";
import StudioFooterSocial from "./StudioFooterSocial";

const GRID_COLS: Record<number, string> = {
  2: "sf-lg:grid-cols-2",
  3: "sf-lg:grid-cols-3",
  4: "sf-lg:grid-cols-4",
  5: "sf-lg:grid-cols-5",
};

export default function StudioStorefrontFooter({
  branding,
  linkContext,
  enabledPages,
  templateId,
  customFooterPages = [],
  footer = null,
  editable,
  selected,
  onSelect,
}: {
  branding: ResolvedStorefrontBranding;
  linkContext: LinkContext;
  enabledPages: StorefrontPageId[];
  templateId: StudioTemplateId;
  customFooterPages?: { slug: string; label: string; column: FooterColumnId }[];
  footer?: FooterSettings | null;
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const { storefrontSlug, draft, basePath } = linkContext;
  const isDemoStore = isWebsiteDemoStorefrontSlug(storefrontSlug);
  const template = resolveStudioTemplate(templateId, "FOOD_BUSINESS");
  const columns = resolveFooterColumns(
    footer?.columns ??
      autoFooterColumns({
        enabledPages,
        footerPages: customFooterPages,
        aboutLabel: templateId === "farmhouse" ? "Our farm" : "About",
      }),
    linkContext,
  );
  const brandShown = footer?.showBrand !== false;
  const gridCols = GRID_COLS[columns.length + (brandShown ? 1 : 0)] ?? "";

  const footerClass =
    template.footerVariant === "editorial-dark"
      ? "studio-footer studio-footer--artisan-dark"
      : template.footerVariant === "farm-location"
        ? "studio-footer studio-footer--farmhouse"
        : "studio-footer studio-footer--market";

  return (
    <footer
      className={`${footerClass} ${selected ? "ring-2 ring-inset ring-[var(--leaf)]" : ""} ${editable ? "cursor-pointer" : ""}`}
      style={footerColours(footer, paletteOf(branding))}
      role={editable ? "button" : undefined}
      aria-label={editable ? "Edit footer" : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              if ((e.target as HTMLElement).closest("a")) e.preventDefault();
              onSelect?.();
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      <div className="mx-auto max-w-[var(--studio-content-max)] py-12 studio-gutter studio-gutter--wide sf-sm:py-16">
        <div className={`grid gap-10 sf-sm:grid-cols-2 ${gridCols}`}>
          <StudioFooterBrand branding={branding} footer={footer} />
          {columns.map((col) => (
            <div key={col.id}>
              {col.heading.trim() ? (
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">{col.heading}</p>
              ) : null}
              {col.contact ? <StudioFooterContact contact={col.contact} /> : null}
              {col.links.length ? (
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.id}>
                      <Link href={l.href} className="text-sm font-medium hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-current/15 pt-6">
          <p className="text-xs opacity-70">
            {footerBottomLine(footer, branding.businessName, new Date().getFullYear())}
            {footer?.showHomeLink === false ? null : (
              <>
                {" · "}
                <Link href={shopHomePath(storefrontSlug, draft, basePath)} className="hover:underline">
                  Home
                </Link>
              </>
            )}
            {isDemoStore
              ? " — Green Valley Farm & Bakes is a fictional store created to demonstrate Vendl."
              : null}
          </p>
          {footer?.showSocial === false ? null : <StudioFooterSocial branding={branding} />}
        </div>
      </div>
    </footer>
  );
}
