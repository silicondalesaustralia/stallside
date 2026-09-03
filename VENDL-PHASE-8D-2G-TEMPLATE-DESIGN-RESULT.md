# Phase 8D.2G — Production Template Design — Result

**Status:** NEEDS REVIEW (visual QA + screenshots required)  
**Date:** 2026-09-02  
**Scope:** Shared design tokens, central template registry, template-specific section presets, three differentiated templates, Farm Stand section, template-aware shop page.

---

## Summary

Phase 8D.2G implements the production template design architecture: a shared token system, expanded template registry with preset matrices, template-aware hero/product/category/nav/footer rendering, and genuinely different starter compositions for Artisan, Farmhouse, and Market.

---

## Delivered

### 1. Shared design token system
- `src/lib/studio/design-tokens.ts` — semantic tokens (`--site-bg`, `--site-accent`, spacing, radii, image ratios) per template
- Tokens applied via `templates.ts` → `tokensToStyle()` on `.studio-template-*` shells

### 2. Central template registry
- `src/lib/studio/templates.ts` — full `StudioTemplateDefinition` (headerVariant, footerVariant, selectorSubtitle, recommendedBusinessModes)
- `src/lib/studio/preset-registry.ts` — hero/product/category/next-drop preset matrices + seller-facing labels per template
- `templatePresetMaps()` helper for editor/settings integration

### 3. Template-specific section variants
- **Hero** — Artisan (editorial/split/background/minimal), Farmhouse (farm-landscape/stand-status/produce-split/simple), Market (shop-first/current-menu/product-collage/promo)
- **Products** — preset mapping (`farm-grid`, `shop-grid`, `dense` → render variants) + template CSS (farm card borders, dense market grid)
- **Categories** — template presets mapped to tiles/cards/compact/minimal layouts
- **Nav** — Farmhouse location line + “What's available”; template header classes
- **Footer** — editorial-dark (Artisan), farm-location (Farmhouse), compact (Market)

### 4. Farm Stand section (Farmhouse)
- `CraftFarmStandSection` + `StudioFarmStandBlock` — location, hours, availability CTA
- Registered in section registry, resolver, insert-section, public-render

### 5. Starter compositions
| Template | Default homepage order |
|----------|------------------------|
| Artisan | Hero → Next drop → Products → Story → Categories → Reviews → Pickup → Signup |
| Farmhouse | Hero → Farm stand → Products → Location → Categories → Story → Signup → Reviews |
| Market | Hero → Categories → Products → Next drop → Reviews → Pickup → Signup |

### 6. Template-aware commerce
- Shop page (`/shop/[slug]/shop`) wraps in `StudioPublicShell` when `websiteStudio` nodes exist — inherits template nav, tokens, footer

### 7. Fixtures
- `scripts/seed-farmhouse-fixture.ts` — produce/eggs stand
- `scripts/seed-market-fixture.ts` — prepared food catalogue (12 products)

### 8. Tests
- Preset distinctness per template
- Preset mapping helpers
- Template registry header/footer variant coverage

---

## Files (key)

```
src/lib/studio/
  design-tokens.ts          NEW
  preset-registry.ts        NEW
  templates.ts              EXPANDED
  starter-composition.tsx   UPDATED (3 templates)
  public-render.tsx         Farm stand + preset imports
  insert-section.tsx        Farm stand case

src/components/studio/
  blocks/StudioHeroBlock.tsx       template-aware variants
  blocks/StudioFarmStandBlock.tsx  NEW
  blocks/StudioProductsBlock.tsx   template density/farm styling
  sections/CraftFarmStandSection.tsx NEW
  shell/StudioStorefrontNav.tsx    template labels + location
  shell/StudioStorefrontFooter.tsx template footer variants
  shell/StudioPublicShell.tsx      activePage prop

src/app/shop/[slug]/shop/page.tsx  studio shell when active
src/app/globals.css                farmhouse/market tokens + footers
```

---

## QA checklist (manual)

- [ ] Template chooser shows three distinct cards with subtitles
- [ ] Switch Artisan → Farmhouse → Market → Artisan (content preserved, layout resets on template apply)
- [ ] Side-by-side: heroes, product grids, nav labels visibly different
- [ ] Farmhouse starter includes Farm Stand section
- [ ] Market shop page uses dense commerce shell
- [ ] Mobile: nav drawer, hero min-heights, product grid columns
- [ ] Screenshots captured for each template (desktop + mobile)

### Preview URLs
- Editor: `/dashboard/website/studio`
- Templates: `/dashboard/website/studio/templates`
- Preview: `/shop/{slug}/studio-preview?draft=1`

---

## Known gaps / follow-up

- Product, Menu, Category detail pages not yet wrapped in studio shell (shop page only)
- Settings panel preset pickers not fully wired to `templatePresetMaps()` for all sections
- Artisan footer dark variant CSS added; further typography polish per 8D.2F notes
- Screenshots not captured in this pass
- Menu-specific section for Market starter uses Next Drop with `current-menu` preset as proxy

---

## Build

```
npx tsc --noEmit   ✅
npm run build      ✅
node --test studio.test.ts ✅
```

---

## Constraints observed

- No commit / push / deploy
- PayPal WIP untouched
- Puck spike/routes/data intact (no Puck development)
