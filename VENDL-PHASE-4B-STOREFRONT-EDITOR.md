# Phase 4B — Storefront editor

**Status:** SHIPPED — 1 September 2026  
**Extends:** Phase 4 v1 (`/shop/{slug}` configuration)

## Draft / publish architecture

Smallest safe model — no version history:

| Field | Purpose |
|-------|---------|
| `draftConfig` (Json) | Working copy: sections, pages, featured products, theme overrides |
| Scalar fields on `Storefront` | headline, subheadline, about, hero, themePreset, contact display |
| `publishedConfig` (Json) | Snapshot of `draftConfig` at last publish |
| `isPublished` | Public `/shop/*` reads published snapshot; `?draft=1` reads draft (owner auth only) |

**Save draft** → updates scalars + `draftConfig`; live site unchanged.  
**Publish** → copies `draftConfig` → `publishedConfig`, sets `isPublished`.  
**Unpublish** → `isPublished = false`; public 404, owner preview still works.

Branding defaults come from Phase 2 onboarding (`Owner.brandAccentColor`, `brandLogoUrl`, `shortDescription`, `suburb`) and primary stand social links — not duplicated unless overridden in editor.

## Editor (`/dashboard/website`)

- Desktop: edit panel (Content / Theme / Pages / Settings) + live iframe preview
- Mobile: Edit | Preview toggle
- Distinct actions: Save draft, Publish, Unpublish, View live site
- Preview URL uses `appBaseUrl()` (localhost in dev)
- Nav label: **Website editor**

## Public storefront (`/shop/{slug}`)

- **Home** — configurable sections (hero, featured, categories, about, ordering, pickup, farm stand, contact, social)
- **Shop** — ONLINE channel products, category filters
- **About / Contact** — enable/disable per seller
- **Product detail** — `/shop/{slug}/product/{productSlug}`
- **Themes** — Farmhouse, Market, Minimal, Modern (CSS variables, single renderer)
- **SEO** — title, description, canonical, Open Graph; `noindex` when unpublished or `?draft=1`
- **Checkout** — still `/s/{standSlug}/cart`; `vendl_shop_slug` cookie returns shoppers to shop

## Deferred

- Custom domain DNS verification / routing
- Gallery image upload in editor (section hidden until images exist)
- Testimonials backend
- Full CMS / arbitrary pages
- Phase 5

## Regression

See manual checklist in commit message / QA notes. `/s/*` and QR URLs unchanged.
