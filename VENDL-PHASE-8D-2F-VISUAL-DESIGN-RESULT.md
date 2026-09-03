# Phase 8D.2F — Website Studio Visual Design (Artisan Pass)

**Status:** NEEDS MORE VISUAL WORK  
**Date:** 2026-09-02  
**Commit:** none (per spec)

---

## Summary

Phase 8D.2F focuses on **Artisan template visual quality** — design tokens, redesigned storefront blocks, new trust/grow sections, template-aware header/footer, editor polish, and a bakery fixture script. Editor architecture from 8D.2 is unchanged.

**Automated gates:** `tsc` ✅ · `npm run build` ✅ · studio/craft tests ✅  
**Visual gate:** Manual screenshot review required — not self-declared pass.

---

## 1. Artisan design direction

Editorial, photography-led bakery/maker aesthetic: generous section spacing, display typography, full-bleed hero option, photography-led product cards, customer-friendly menu/drop language.

---

## 2. Fixture

**Script:** `scripts/seed-artisan-bakery-fixture.ts`  
**Default stand:** `green-valley-baked-goods` (override via `STUDIO_FIXTURE_STAND_SLUG`)

Seeds: Hearth & Crumb branding copy, 8 products, 3 categories, Saturday Bake pre-order menu.

Run: `npx tsx scripts/seed-artisan-bakery-fixture.ts`

---

## 3–7. Design systems

| System | Implementation |
|--------|----------------|
| Typography | `.studio-display`, `.studio-heading`, `.studio-eyebrow` + template CSS vars |
| Spacing | `.studio-section`, `--studio-section-py`, `--studio-content-max` |
| Colour | Storefront uses seller theme; editor shell stays neutral grey |
| Images | Hero/products/categories with aspect ratios + intentional no-image fallbacks |
| Buttons | `.studio-btn--primary`, `.studio-btn--secondary` |

Tokens: `src/lib/studio/artisan/tokens.ts` · CSS: `globals.css` under `.studio-template-artisan`

---

## 8–18. Sections implemented

| Section | Block | Presets / notes |
|---------|-------|-----------------|
| Header | `StudioStorefrontNav` | Editorial underline nav (not dashboard pills); mobile menu |
| Hero | `StudioHeroBlock` | Editorial, Split, Background, Minimal |
| Products | `StudioProductsBlock` | Editorial, Classic, Featured, Compact |
| Categories | `StudioCategoriesBlock` | Tiles, Cards, Compact, Minimal + category images |
| Next Drop | `StudioNextDropBlock` | Featured, Card, Timeline; customer date labels |
| Image + Text | `StudioImageTextBlock` | Existing, used in Artisan starter for story |
| About | `PuckAboutBlock` | Simple/Card (non-Artisan templates) |
| Reviews | `StudioReviewsBlock` | **NEW** — approved reviews only; editor setup hint |
| Pickup & Delivery | `StudioPickupBlock` | **NEW** — public fulfilment options |
| Subscriber Signup | `StudioSignupBlock` | **NEW** — restock alert consent flow |
| Footer | `StudioStorefrontFooter` | Logo area, explore links, contact, copyright |

---

## 19–24. Editor changes

- **Palette:** Single instruction “Drag onto your page or click to add”; benefit-led descriptions per section
- **Shell:** `StudioEditorShell` replaces generic editor shell — template nav + footer on canvas
- **Settings:** Existing right panel (preset picker component added at `PresetPicker.tsx`; hero/products presets wired in blocks)
- **Public render:** Fixed to walk page canvas children (not ROOT directly); uses studio blocks server-side

---

## 25–27. Commerce pages

Product/Menu/Shop visual pass **deferred** — homepage Artisan focus per spec §55 phase order (8D.2F.6). Farmhouse/Market preserved technically, not visually polished.

---

## 28–31. Empty states

- Public: hide Reviews, Categories, Products, Next Drop when no data
- Editor: setup hints for missing menus/reviews/products
- No “No menus found” on public site

---

## 32. SSR / performance

Public preview `/shop/[slug]/studio-preview` uses `StudioPublicShell` + `StudioPublicSections` — **no Craft.js runtime**.

---

## 33. Screenshots (required — not captured this session)

Review at 1440 / 1366 / mobile:

1. Artisan desktop Home  
2. Artisan mobile Home  
3. Editor with palette  
4. Editor Hero selected  
5. Template chooser  
6. Product / Menu / Shop pages (after 8D.2F.6)

---

## 34. Visual review answers (pending screenshots)

| Question | Answer |
|----------|--------|
| Hero professionally designed? | **Pending review** |
| Products attractive? | **Pending review** |
| Next Drop feels like an event? | Improved copy/layout; **pending review** |
| Site separates from dashboard UI? | Yes — neutral editor chrome + template storefront shell |
| Mobile intentionally designed? | Responsive tokens added; **pending review** |

---

## 35. Tests

```
npx tsx --test src/lib/studio/studio.test.ts src/lib/craft/craft.test.ts
```

Added validation for `CraftReviewsSection`. Reviews loader: `src/lib/studio/load-reviews.ts`.

---

## 36. Farmhouse / Market

Unchanged visually. Artisan tokens/components designed for reuse via template CSS vars.

---

## 37. Remaining visual work

- Hero/product/menu preset thumbnail pickers in settings (partial — `PresetPicker` exists)
- Product / Menu / Shop page Artisan consistency (8D.2F.6)
- Screenshot QA gate
- Richer category/menu photography in fixture
- Approved reviews seeding (requires order fixture)
- Inline canvas text editing (evaluated, deferred)

---

## 38. Git status

Uncommitted. No commit/push/deploy.

**Recommendation:** `NEEDS MORE VISUAL WORK` — run bakery fixture, capture screenshots, review Artisan homepage at `/dashboard/website/studio` with Artisan template selected.
