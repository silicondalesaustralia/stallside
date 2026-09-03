# Phase 4 — Online storefront

**Status:** v1 + 4B editor — 1 September 2026  
**Public URL:** `https://vendl.app/shop/{slug}` (or `http://localhost:3000/shop/{slug}` in dev)  
**Farm stands:** `/s/{standSlug}` QR URLs unchanged forever.

## What shipped

### Storefront model

- Per-owner storefront with slug, branding, draft/publish config
- Checkout flows through primary stand cart (`/s/{standSlug}/cart`) with shop-origin cookie
- Catalog: **ProductChannel ONLINE** on primary stand

### Dashboard

- **Website → Website editor** — visual editor with live preview, themes, sections, pages
- **Website → Domains** — save intended domain; DNS not connected yet

### Phase 4B (editor + public site)

See `VENDL-PHASE-4B-STOREFRONT-EDITOR.md`.

## Not shipped

- Live custom domain routing
- Nullable `Product.standId`
- Phase 5
