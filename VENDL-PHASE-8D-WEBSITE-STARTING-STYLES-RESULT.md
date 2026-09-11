# VENDL — Phase 8D Website Starting Styles — Result

## Flow

**Previous:** Scaffold → colour look → build (layout recipe chips on scaffold).

**Final:** Scaffold (business/pages/feel) → **starting style** (Let Vendl choose + 10 blueprints with full homepage example mocks) → colour look → build.

Default remains **Let Vendl choose for me**. Seller override is respected on build (planner re-runs with `blueprintId`).

## Blueprint architecture

Structured config under `src/lib/website/blueprints/`:

- `types.ts` — `WebsiteBlueprintId`, blueprint shape
- `registry.ts` — all 10 styles
- `recommend.ts` — recommendation + choice resolution
- `demo-preview.ts` — example product/category/hero imagery for UI mocks
- `blueprints.test.ts`

Each blueprint maps to an existing design system (Artisan / Farmhouse / Market), a layout recipe, preferred home slots, and section presets. No second renderer.

## The 10 styles

| ID | Name | Design system |
|----|------|---------------|
| editorial | Editorial | artisan |
| marketplace | Marketplace | market |
| heritage | Heritage | farmhouse |
| minimal | Minimal | artisan |
| bold | Bold | market |
| local | Local | farmhouse |
| studio | Studio | artisan |
| modern-store | Modern Store | market |
| catalogue | Catalogue | market |
| boutique | Boutique | artisan |

## Recommendation

`recommendWebsiteBlueprint(businessContext, selectedPages, intent)` returns id, confidence, reason codes, and a short user-facing reason. Signals include catalogue size, farm stand, menus/preorders, photography, story length, style feel chips. Fallback: **Modern Store**.

## UI / examples

- Cards show a **rendered homepage mock** (hero, categories when relevant, product cards with images + prices, story, reviews, signup).
- **See example** opens a larger lightbox of the same complete homepage mock (not a live demo store).
- Imagery uses curated Unsplash example products (fictional / non-food capable). Live demo stores deferred.

## Build wiring

- Scaffold returns recommendation + business name.
- Build accepts `blueprintId` (`vendl-choose` or explicit id), re-plans with blueprint, then applies look and compiles Craft draft.
- Persists `initialBlueprintId` on draft config; existing sites without it remain fine.

## Tests / build

- `npx tsc --noEmit` — pass
- `npm run test:website-ai` — includes blueprint registry, recommend, override, distinct plans
- Next production build — run after this doc if not already green

## Known limitations / next

- Homepage examples are CSS mocks of the complete look, not pixel screenshots of `/studio-preview`.
- Real demo storefronts + captured screenshots can replace mocks later.
- Analytics events from the brief not wired yet.
- OpenAI planner path should eventually receive blueprint context in the prompt (heuristic path is authoritative for composition today).
