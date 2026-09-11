"use client";

import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import {
  DEMO_CATEGORIES,
  DEMO_HERO_IMAGES,
  WEBSITE_BLUEPRINT_IDS,
  productsForBlueprint,
} from "@/lib/website/blueprints";

type Props = {
  blueprint: WebsiteBlueprint;
  businessName?: string;
  /** larger lightbox view */
  expanded?: boolean;
};

const HERO_BY_STYLE: Record<string, string> = {
  editorial: DEMO_HERO_IMAGES.fashion,
  marketplace: DEMO_HERO_IMAGES.studio,
  heritage: DEMO_HERO_IMAGES.food,
  minimal: DEMO_HERO_IMAGES.studio,
  bold: DEMO_HERO_IMAGES.bold,
  local: DEMO_HERO_IMAGES.landscape,
  studio: DEMO_HERO_IMAGES.craft,
  "modern-store": DEMO_HERO_IMAGES.studio,
  catalogue: DEMO_HERO_IMAGES.fashion,
  boutique: DEMO_HERO_IMAGES.craft,
};

export default function BlueprintHomepagePreview({
  blueprint,
  businessName = "North & Field",
  expanded = false,
}: Props) {
  const t = blueprint.previewTone;
  const offset = WEBSITE_BLUEPRINT_IDS.indexOf(blueprint.id);
  const productCount =
    blueprint.contentDensity === "high" ? 8 : blueprint.contentDensity === "low" ? 4 : 6;
  const products = productsForBlueprint(Math.max(0, offset) * 2, productCount);
  const hero = HERO_BY_STYLE[blueprint.id] ?? DEMO_HERO_IMAGES.studio;
  const showCats =
    blueprint.commerceEmphasis === "commerce-led" ||
    blueprint.id === "marketplace" ||
    blueprint.id === "catalogue" ||
    blueprint.id === "modern-store";
  const showStory =
    blueprint.commerceEmphasis !== "commerce-led" || blueprint.id === "modern-store";

  return (
    <div
      className={
        expanded
          ? "mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-black/10 shadow-lg"
          : "pointer-events-none h-full w-full overflow-hidden"
      }
      style={{ background: t.bg, color: t.ink, fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Nav */}
      <div
        className="flex items-center justify-between px-3 py-2 text-[7px] font-sans tracking-wide sm:text-[9px]"
        style={{ borderBottom: `1px solid ${t.wash}` }}
      >
        <span className="font-semibold">{businessName}</span>
        <span style={{ color: t.muted }}>Shop · About · Contact</span>
      </div>

      {/* Hero */}
      {t.heroStyle === "minimal" ? (
        <div className="px-4 py-8 text-center sm:py-10">
          <p className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: t.muted }}>
            New season
          </p>
          <h3 className="mt-2 text-lg leading-tight sm:text-2xl">{businessName}</h3>
          <p className="mx-auto mt-2 max-w-[70%] font-sans text-[8px] sm:text-[10px]" style={{ color: t.muted }}>
            Quiet pieces, carefully made.
          </p>
        </div>
      ) : t.heroStyle === "bold" ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="max-w-[80%] text-xl font-black uppercase leading-none tracking-tight text-white sm:text-3xl">
              Shop the drop
            </h3>
            <span
              className="mt-2 inline-block px-2 py-1 font-sans text-[8px] font-bold uppercase text-black"
              style={{ background: t.accent }}
            >
              Shop now
            </span>
          </div>
        </div>
      ) : t.heroStyle === "collage" ? (
        <div className="grid grid-cols-3 gap-1 p-2">
          {products.slice(0, 3).map((p) => (
            <div key={p.name} className="aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : t.heroStyle === "split" ? (
        <div className="grid grid-cols-2">
          <div className="flex flex-col justify-center gap-2 p-3 sm:p-5">
            <h3 className="text-base leading-tight sm:text-xl">{businessName}</h3>
            <p className="font-sans text-[8px] sm:text-[10px]" style={{ color: t.muted }}>
              {blueprint.description.slice(0, 72)}…
            </p>
            <span
              className="mt-1 inline-block w-fit px-2 py-1 font-sans text-[8px] font-semibold text-white"
              style={{ background: t.accent, borderRadius: t.cardRadius }}
            >
              Shop
            </span>
          </div>
          <div className="relative min-h-[90px] sm:min-h-[140px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      ) : (
        <div className="relative aspect-[21/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 to-transparent p-3 sm:p-5">
            <h3 className="text-base text-white sm:text-xl">{businessName}</h3>
            <p className="mt-1 font-sans text-[8px] text-white/85 sm:text-[10px]">
              Fresh picks · ready this week
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      {showCats ? (
        <div className="px-3 py-3" style={{ background: t.wash }}>
          <p className="mb-2 font-sans text-[8px] font-semibold uppercase tracking-wide">
            Shop by category
          </p>
          <div className="flex gap-2 overflow-hidden">
            {DEMO_CATEGORIES.slice(0, 3).map((cat) => (
              <div key={cat.title} className="min-w-0 flex-1">
                <div
                  className="aspect-[4/3] overflow-hidden"
                  style={{ borderRadius: t.cardRadius }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <p className="mt-1 truncate font-sans text-[8px] font-medium">{cat.title}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Products */}
      <div className="px-3 py-3">
        <p className="mb-2 font-sans text-[8px] font-semibold uppercase tracking-wide">
          {blueprint.commerceEmphasis === "story-led" ? "Featured" : "Shop"}
        </p>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(blueprint.previewTone.productCols, expanded ? 4 : 3)}, minmax(0, 1fr))`,
          }}
        >
          {products.slice(0, expanded ? productCount : Math.min(productCount, 6)).map((p) => (
            <div key={p.name}>
              <div
                className="aspect-square overflow-hidden"
                style={{ background: t.wash, borderRadius: t.cardRadius }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 truncate font-sans text-[8px] font-medium leading-tight">{p.name}</p>
              <p className="font-sans text-[7px]" style={{ color: t.muted }}>
                {p.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      {showStory ? (
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <div
            className="aspect-[4/3] overflow-hidden"
            style={{ borderRadius: t.cardRadius }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEMO_HERO_IMAGES.craft}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-1 py-1">
            <p className="text-[10px] leading-snug sm:text-xs">Our story</p>
            <p className="font-sans text-[7px] leading-relaxed sm:text-[8px]" style={{ color: t.muted }}>
              Made in small batches with care — from our workshop to your door.
            </p>
          </div>
        </div>
      ) : null}

      {/* Reviews strip */}
      <div className="px-3 pb-3">
        <div
          className="px-2 py-2 text-center"
          style={{ background: t.wash, borderRadius: t.cardRadius }}
        >
          <p className="text-[10px] leading-none" style={{ color: t.accent }}>
            ★★★★★
          </p>
          <p className="mt-1 font-sans text-[7px]" style={{ color: t.muted }}>
            “Beautiful quality — arrived fast.”
          </p>
        </div>
      </div>

      {/* Signup */}
      <div
        className="px-3 py-3 text-center"
        style={{ background: t.ink, color: t.bg }}
      >
        <p className="text-[10px]">Stay in the loop</p>
        <div
          className="mx-auto mt-2 h-4 max-w-[70%] rounded-sm"
          style={{ background: `${t.bg}22` }}
        />
      </div>
    </div>
  );
}
