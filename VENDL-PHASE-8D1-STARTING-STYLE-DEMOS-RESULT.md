# VENDL — Phase 8D.1 Starting Style Demos — Result

## Summary

Starting-style gallery now holds **content constant and varies design**. All ten styles render from shared demo kits (same images, products, and copy, including About Us). Seller business name / logo appears in every header. Unsplash / per-style placeholder copy is gone.

## Confirmed causes of original problems (§1)

| Problem | Cause found |
|---|---|
| Unrelated imagery / products | `demo-preview.ts` Unsplash pools + per-blueprint product offsets |
| Style descriptions in heroes | `blueprint.description` used as hero subheading |
| Hard-coded copy | Strings like “SHOP THE DROP”, “Quiet pieces…” in preview |
| Structurally similar cards | Shared `heroStyle` buckets (split/full/minimal) only |
| Live-scaled DOM clipping | Card used `scale-[0.92]` on live preview (still used for thumbnails; layouts now fit fold better) |
| No brand kit on cards | Cards showed name + long description only |

## What shipped

### Demo kits (`src/lib/website/demo-kits/`)

- **Green Valley**, **Mill & Crumb**, **North & Field**
- Each: 12 products / 4 categories / hero+place+process images / copy
- **About Us** on every kit: `heading`, `short`, `long`, `pillars` with `{businessName}` tokens
- Local SVG assets under `public/demo/kits/<kitId>/` (placeholder still-lifes until AI image lock)

### Blueprint V2 fields

- `layout` (unique header / hero / merch per style)
- `brandKit` (palette, fonts, logo placement, shape)
- `assetNeeds`, `cardDescription` (≤50), `layoutTags`
- Registry distinctness rules (§6.2) + tests

### Gallery UI

- Kit switcher; shared kit across all ten cards
- Brand strip (logo/wordmark + swatches + Aa)
- `cardDescription` + layout tags + font pairing
- Demo lightbox with “examples” banner; About copy from kit
- Distinct header / hero / merch previews per style

### Seller-site guardrails

- `assertNoDemoAssets` in `compilePlanToStudioPayload` — demo kit paths rejected
- Recommender deprioritises image-led styles when photo count is low

## Not in this pass (follow-ups)

- AI-generated photographic kit lock + SHA manifests
- Playwright base/seller capture pipeline, QA gates, contact sheet
- True static card thumbnails (replace live scaled DOM)
- Live multi-page demo storefront with style switcher
- 8D.2 “Preview with my products”

## Tests / build

- `npm run test:website-ai` — **31 pass** (includes demo kits + distinctness + demo-asset rejection)
- `npx tsc --noEmit` — pass

## Files of note

```
src/lib/website/demo-kits/
src/lib/website/blueprints/{layout-types,layouts,brand-kits,card-meta,distinctness}.ts
src/lib/website/presets/logo-placement.ts
src/lib/website/demo-assets/reject-demo-assets.ts
src/components/website-ai/demo/*
public/demo/kits/{green-valley,mill-and-crumb,north-and-field}/
```
