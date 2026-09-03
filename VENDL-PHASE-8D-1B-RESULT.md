# Phase 8D.1B — Puck Editor UX Simplification Gate

**Date:** 2026-09-02  
**Puck package:** `@puckeditor/core@0.21.3`  
**Gate status:** **PASS**

## 1. Puck APIs used (documented)

| API | Use |
|-----|-----|
| `<Puck>` | Composition engine + state |
| `overrides.header` | Vendl top bar (page, viewports, undo/redo, save/publish) |
| `overrides.drawer` / `outline` | Hidden (empty fragment) |
| `overrides.fields` | Contextual right drawer when section selected |
| `overrides.componentOverlay` | Subtle selection bar + move/delete/duplicate |
| `overrides.actionBar` | Suppressed default action bar |
| `overrides.puck` | Sidebar sync + Add Section modal + Sections panel |
| `_experimentalFullScreenCanvas` | Canvas-first layout |
| `ui.leftSideBarVisible` / `rightSideBarVisible` | Hide block palette; show drawer on select |
| `dispatch` (`insert`, `remove`, `reorder`, `duplicate`, `setUi`) | Custom Add Section + toolbar actions |
| `usePuck` (`history`, `selectedItem`, `appState`) | Undo/redo, section list |
| `resolvePermissions` | Singleton duplicate/delete rules |
| `resolveFields` + `visible` | Conditional commerce pickers |
| Custom field `render` | Product + category pickers |
| `@puckeditor/core/rsc` `<Render>` | Public preview (unchanged) |

No Puck fork. No undocumented DOM manipulation.

## 2. Stock Puck UI removed/hidden

- Permanent **Blocks / Outline** sidebar hidden
- Default Puck header chrome replaced with Vendl top bar
- Default viewport/zoom controls hidden
- Default action bar suppressed
- No seller-facing “Puck”, “Blocks”, “Component”, “Props” labels

## 3. Editor shell

Route: `/dashboard/website/puck-spike` (linked from existing Website editor)

- Neutral white/grey chrome (not green Puck skin)
- Full-width canvas with `_experimentalFullScreenCanvas`
- Top bar: Home, Desktop/Tablet/Mobile, Sections (optional), Undo/Redo, Preview, Save draft, Publish

## 4–7. Canvas, selection, Add Section

- Click section → subtle outline + compact name bar
- **Move up/down**, **Delete**, **Duplicate** (when allowed)
- **+ Add section** below selected section + chooser modal
- Chooser: Recommended / Sell / Content / Business groupings
- Context-aware by `businessMode` (e.g. farm stand hides Next drop)

## 8. Singleton / repeatable / required rules

| Section | Rule |
|---------|------|
| Hero | singleton |
| UpcomingMenus | singleton (FOOD_BUSINESS/BOTH only) |
| About | singleton |
| Text, FeaturedProducts | repeatable |

Enforced via: chooser filtering, `resolvePermissions` (no duplicate on singletons), `normaliseSingletons()` on load.

## 9–11. Reorder + settings drawer

- Drag reorder (Puck native) + Move up/down buttons
- Right drawer (desktop) / bottom sheet (mobile) with **Done**
- Seller-language fields; product/category pickers (not raw IDs)

## 12. Commerce pickers

**Products section:** Show all / category / choose products; grid/list; columns; show prices/availability.

## 13–16. Save/publish, preview, mobile

- Save draft / Publish unchanged (additive `puckSpike` in `draftConfig`)
- Preview: `/shop/[slug]/puck-preview?draft=1` (no editor bundle)
- Mobile: drawer as sheet; touch-friendly targets

## 17. Tests

- `src/lib/puck/placement-rules.test.ts` — 8 tests (singleton, mutations)
- `src/lib/puck/spike.test.ts` — 4 tests (storage)
- **12/12 pass**

## 18. Build

- `npx tsc --noEmit` — PASS
- `npm run build` — PASS

## 19. Remaining UX limitations

- Single page (Home) only — page selector is static label for now
- Hero inline text editing not implemented (drawer-only; acceptable per spec)
- Category product filter depends on `productCategory` links in DB
- Footer canvas “+ Add section” button component written but relies primarily on overlay/modal flow

## 20. Gate result

**PASSES** — Puck remains the engine; seller-facing UX is Vendl-native, canvas-first, and understandable without documentation.

**Do NOT commit / push / deploy.**
