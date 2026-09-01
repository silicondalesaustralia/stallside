# Phase 4 — Online storefront (v1)

**Status:** SHIPPED (v1) — 1 September 2026  
**Public URL:** `https://vendl.app/shop/{slug}`  
**Farm stands:** `/s/{standSlug}` QR URLs unchanged forever.

## What shipped

### Storefront model

- `Storefront` per owner: slug, headline, about, `isPublished`, `customDomain` (saved only)
- Checkout still flows through the owner's **primary stand** cart (`/s/{standSlug}/cart`)
- Catalog shows products with **ProductChannel ONLINE** enabled on the primary stand

### Dashboard

- **Website → Online shop** (`/dashboard/website`) — publish, headline, about, slug
- **Website → Domains** (`/dashboard/website/domains`) — save intended domain; DNS/HTTPS wiring deferred

### Not in v1

- Full page builder / sections / themes
- Live custom domain routing
- Replacing stand URLs for food businesses
- Nullable `Product.standId`

## Follow-on (Phase 4+)

1. DNS verification + custom domain → storefront
2. Storefront sections (hero, featured categories, about)
3. Category navigation on `/shop/*`
4. SEO / OG per storefront
