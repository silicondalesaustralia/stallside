# Phase 8D.1 — Puck spike result

**Date:** 2026-09-02  
**Puck package:** `@puckeditor/core@0.21.3`  
**Status:** Spike PASS — proceed to 8D.2+

## Spike checklist

| # | Requirement | Result |
|---|-------------|--------|
| 1 | Puck runs with Vendl Next.js / React stack | PASS — React 19, Next 16 |
| 2 | Builds with current tooling | PASS — see build output below |
| 3 | Renders in authenticated dashboard | PASS — `/dashboard/website/puck-spike` |
| 4 | Loads existing seller page data | PASS — migrates Phase 4B sections → Puck home on first load |
| 5 | Saves Puck JSON to draft architecture | PASS — additive `puckSpike` key in `draftConfig` |
| 6 | Same JSON renders publicly without editor | PASS — `/shop/[slug]/puck-preview` uses `@puckeditor/core/rsc` `<Render>` |
| 7 | Live Product data in Puck component | PASS — `FeaturedProducts` via server metadata |
| 8 | Live Menu/Drop data in Puck component | PASS — `UpcomingMenus` via `loadUpcomingMenusForStorefront` |
| 9 | Desktop / Tablet / Mobile preview | PASS — Puck viewports configured |
| 10 | Editor styled like Vendl | PASS — `.vendl-puck-spike` CSS overrides |
| 11 | No unsafe client exposure of private data | PASS — metadata scoped to owner context server-side |
| 12 | Existing storefront routes + checkout unchanged | PASS — spike is additive; `/shop/[slug]` and `/s/*` untouched |

## Spike components implemented

- Hero
- Text (Heading + text)
- Featured Products
- Upcoming Menus / Drops
- About

## Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/website/puck-spike` | Puck editor (spike) |
| `/shop/[slug]/puck-preview?draft=1` | Authenticated draft preview |
| `/shop/[slug]/puck-preview` | Published preview (when published) |

## Config storage (additive)

```json
{
  "sections": [ "...legacy Phase 4B..." ],
  "pages": { "...": "..." },
  "puckSpike": {
    "version": 1,
    "engine": "puck",
    "home": { "content": [], "root": { "props": {} } }
  }
}
```

Legacy `parseStorefrontConfig()` ignores `puckSpike`. Reversible — no destructive migration.

## Compatibility notes

- `@measured/puck` is deprecated; using `@puckeditor/core@0.21.3` per Puck 0.21 namespace move.
- Puck editor is client-only — loaded via `dynamic(..., { ssr: false })` to avoid Turbopack `node:module` chunk errors.
- Puck block components must not import modules that pull Prisma into the client bundle (e.g. `@/lib/menu` → use `@/lib/storefront/paths` for `shopMenuPath`).
- Public pages use `@puckeditor/core/rsc` `<Render>` — editor bundle not shipped to storefront visitors on `/puck-preview`.
- `FeaturedProducts` manual product picker deferred to full build; spike uses auto + comma-separated IDs field.

## Build / typecheck

- `npx tsc --noEmit` — PASS
- `npm run build` — PASS (Turbopack)
- `npx tsx --test src/lib/puck/spike.test.ts` — 4/4 PASS

## Next steps (8D.2+)

1. Config versioning (`editorVersion`, page/template model)
2. Replace `StorefrontEditor` with full Puck shell
3. Remaining blocks + dynamic templates
4. Custom pages, blog, SEO (84A–84AS)
5. Phase 4B → Puck migration adapter on publish path

**Do NOT commit / push / deploy per spec.**
